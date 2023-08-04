const chalk = require("chalk");
const { AttributeIds, OPCUAClient, TimestampsToReturn, SecurityPolicy, MessageSecurityMode, UserTokenType } = require("node-opcua");
const fileHandler = require("./file");

let endpointUrl;
//const endpointUrl = "opc.tcp://DESKTOP-H19DHJH:53530/OPCUA/SimulationServer";
let client, session, subscription;

let dataValueMemory = [];
let nodeIdKeys;

module.exports = {

  createOPCUAClient: async function (io, config) {
    endpointUrl = config.endpointUrl;
    nodeIdKeys = Object.keys(config.nodeIds);
    client = OPCUAClient.create({
      securityMode: MessageSecurityMode.SignAndEncrypt,
      securityPolicy: SecurityPolicy.Basic256Sha256,
      endpointMustExist: false,
    });
    client.on("backoff", (retry) => {
      console.log("Retrying to connect to ", endpointUrl, " attempt ", retry);
      clearInterval(intervalId);
    })
      .on("connection_failed", () => {
        console.log(`Client failed to connect.`);
        clearInterval(intervalId);
      })
      .on("connection_lost", () => {
        console.log(`Client lost the connection.`);
        clearInterval(intervalId);
      })
      .on("start_reconnection", () => {
        console.log(`Client is starting the reconnection process.`);
      })
      .on("reconnection_attempt_has_failed", (_, message) => {
        console.log(`Client reconnection attempt has failed: ${message}`);
      })
      .on("after_reconnection", () => {
        console.log(`Client finished the reconnection process.`);
        this.emitHistoricalArrayValuesForLinecharts(io, config);
        create(io, config);
      })
      .on("close", () => {
        console.log(`Client closed and disconnected`);
        clearInterval(intervalId);
      })
      .on("timed_out_request", (request) => {
        console.log(`Client request timed out: ${request.toString()}`);
        clearInterval(intervalId);
      });
    console.log(" connecting to ", chalk.cyan(endpointUrl));
    await client.connect(endpointUrl);
    console.log(" connected to ", chalk.cyan(endpointUrl));

    return create(io, config);
  },

  stopOPCUAClient: async function () {
    if (subscription) await subscription.terminate();
    if (session) await session.close();
    if (client) await client.disconnect();
  },

  emitHistoricalArrayValuesForLinecharts: async function (io, config) { 
  // get historical data of linecharts in case of reconnect (either client connect or opcua reconnect)
  // the other values are emitted every config.emitInterval milliseconds either way, no need for old data or dataValueMemory
    console.log("get and emit historical datavalues (array) for linecharts");
    if (client != null && nodeIdKeys != null) {
      nodeIdKeys.forEach((v, i) => {
        // linechart values as array
        if (config.nodeIds[v].csv) {
          let emittedValue = fileHandler.getLatestValues(fileHandler.getCurrentNodeIdFile(v, config), config.nodeIds[v].hoursRead);
          if (emittedValue == -1) return; // do nothing if file not found (happens at first start of the day)

          io.sockets.emit(v, {
            value: emittedValue,
            // timestamp: null, // not used in the case of emitting arrays, see main.js
            currentTime: new Date()
          });

          // console.log(v);
          // console.log(dataValueMemory[i].value.value);
          // console.log(new Date(Date.parse(dataValueMemory[i].sourceTimestamp)));
        }
      });
    }
  },

  storeLogData: function (config) {
    console.log("Storing log data");
    let filepath = `${config.logPath}/${fileHandler.getCurrentDateAsFolderName()}.csv`;
    fileHandler.deleteCSV(filepath)
    let content = "";
    nodeIdKeys.forEach((v, i) => {
      content += `${v};`;
      //fileHandler.appendToCSV(`${config.logPath}/${fileHandler.getCurrentDateAsFolderName()}.csv`, `${v};`);
    });
    content += "\n";
    nodeIdKeys.forEach((v, i) => {
      content += `${dataValueMemory[v].value};`;
    });
    fileHandler.appendToCSV(filepath, content);
  },

  createFolderHierarchy: function(config) {
    fileHandler.createFolderHierarchy(config);
  }
}

async function create(io, config) {
  if (subscription) await subscription.terminate();
  
  if (session) {
    while (session._reconnecting.reconnecting){
      console.log("reconnecting before closing the session ...");
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
    }
    await session.close();
  }

  if (!await createSession(config)){
    return false;
  }

  await createSubscription();

  await createMonitoringItems(io, config);

  await insertPreviousDatavalueForLinecharts(io, config);

  intervalId = setInterval(() => { getAndEmitLiveDatavalues(io, config) }, config.emitInterval);

  return true;
}

async function createMonitoringItems(io, config) {
  const subscriptionParameters = {
    samplingInterval: 100,
    discardOldest: true,
    queueSize: 100,
  };

  const itemsToMonitor = [];
  for (const nodeId of nodeIdKeys) {
    itemsToMonitor.push({
      nodeId: config.nodeIds[nodeId].id,
      attributeId: AttributeIds.Value,
    });
  }

  const monitoredItems = await subscription.monitorItems(itemsToMonitor, subscriptionParameters, TimestampsToReturn.Both);

  /*monitoredItems.on("changed", (monitoredItem, dataValue, index) => {
    dataValueMemory[index] = dataValue;
  
    fileHandler.storeValueInCSVBasedOnConfig(nodeIdKeys[index], dataValue.value.value, dataValue.sourceTimestamp, config);

    io.sockets.emit(nodeIdKeys[index], {
      value: dataValue.value.value,
      timestamp: Date.parse(dataValue.sourceTimestamp),
      currentTime: new Date()
    });

    //console.log(nodeIdKeys[index]);
    //console.log(dataValue.value.value);
    //console.log(new Date(Date.parse(dataValue.sourceTimestamp)));
  });*/
}

async function createSession(config) {
  const userIdentity = {
    type: UserTokenType.UserName,
    userName: config.opcua.username,
    password: config.opcua.password,
  }
  try {
    session = await client.createSession(userIdentity);
  } catch (error) {
    console.log(chalk.yellow("Could not create session!"));
    return false;
  }
  console.log(chalk.yellow("session created"));
  return true;
}

async function createSubscription() {
  subscription = await session.createSubscription2({
    requestedPublishingInterval: 1000,
    requestedLifetimeCount: 100,
    requestedMaxKeepAliveCount: 10,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10
  });

  subscription
    .on("keepalive", function () {
      console.log(" SUBSCRIPTION KEEPALIVE ------------------------------->");
      // emitCurrentDataValues(io);
    })
    .on("terminated", function () {
      console.log(" SUBSCRIPTION TERMINATED ------------------------------>");
      clearInterval(intervalId);
    })
    .on("error", function () {
      console.log(" SUBSCRIPTION ERROR");
      clearInterval(intervalId);
    })
    .on("internal_error", function () {
      console.log(" INTERNAL ERROR");
      clearInterval(intervalId);
    });
}

async function getAndEmitLiveDatavalues(io, config) {
  console.log("get & emit current data values");

  for (const nodeIdName of nodeIdKeys) {
    if (!session._closed) {
      const dataValue = await session.read({
        nodeId: config.nodeIds[nodeIdName].id,
        attributeId: AttributeIds.Value,
      });

      dataValueMemory[nodeIdName] = { value: dataValue.value.value, timestamp: Date.parse(dataValue.sourceTimestamp) };

      io.sockets.emit(nodeIdName, {
        value: dataValue.value.value,
        timestamp: Date.parse(dataValue.sourceTimestamp),
        currentTime: new Date()
      });

      fileHandler.storeValueInCSVBasedOnConfig(nodeIdName, dataValue.value.value, dataValue.sourceTimestamp, config);
    } else if (config.nodeIds[nodeIdName].csv && dataValueMemory[nodeIdName] !== undefined) { 
      // in case of an inactive or closed session, we simply emit the last value every config.emitInterval seconds
      // ONLY needed for linechart datavalues
      // ONLY do this if we already have a value inside dataValueMemory
      console.log("fill missing values because of faulty session");

      // add x milliseconds to previous timestamp
      // use this method instead of getting server timestamp because we dont have a valid session when being in this if branch
      dataValueMemory[nodeIdName].timestamp += config.emitInterval;

      io.sockets.emit(nodeIdName, {
        value: dataValueMemory[nodeIdName].value,
        timestamp: dataValueMemory[nodeIdName].timestamp,
        currentTime: new Date()
      });

      fileHandler.storeValueInCSVBasedOnConfig(
        nodeIdName, 
        dataValueMemory[nodeIdName].value, 
        new Date(dataValueMemory[nodeIdName].timestamp), 
        config);
    }
  }
}


async function insertPreviousDatavalueForLinecharts(io, config) {
  // avoid the diagonal in the linecharts by adding a point immediately before we add the actual newest datavalue
  console.log("insert and emit previous datavalue for linecharts");

  for (const nodeIdName of nodeIdKeys) {
    if (config.nodeIds[nodeIdName].csv) {
      const dataValue = await session.read({
        nodeId: config.nodeIds[nodeIdName].id,
        attributeId: AttributeIds.Value,
      });

      let emittedValue = fileHandler.getLatestValues(fileHandler.getCurrentNodeIdFile(nodeIdName, config), config.nodeIds[nodeIdName].hoursRead);
      if (emittedValue == -1) return; // do nothing if file not found (happens at first start of the day)

      // get the latest datavalue
      let lastEntry = emittedValue[emittedValue.length - 1];
      // change the timestamp to the current server timestamp, keep the value the same
      lastEntry[1] = Date.parse(dataValue.sourceTimestamp);
      // add dummy entry (simply the previous value with the current server timestamp)
      emittedValue.push(lastEntry);

      dataValueMemory[nodeIdName] = { value: lastEntry[0], timestamp: lastEntry[1] };

      io.sockets.emit(nodeIdName, {
        value: lastEntry[0],
        timestamp: lastEntry[1],
        currentTime: new Date()
      });

      fileHandler.storeValueInCSVBasedOnConfig(nodeIdName, lastEntry[0], dataValue.sourceTimestamp, config);
    }
  }
}




