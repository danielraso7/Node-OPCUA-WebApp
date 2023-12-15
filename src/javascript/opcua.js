const chalk = require("chalk");
const { AttributeIds, OPCUAClient, TimestampsToReturn, SecurityPolicy, MessageSecurityMode, UserTokenType } = require("node-opcua");
const fileHandler = require("./file");

let endpointUrl;

let client, session, subscription;

let dataValueMemory = [];
let nodeIdKeys;

module.exports = {

  /**
   * Create an OPCUA - client by setting up parameters, actions and Subscriptions, Sessions and monitored items.
   * @param {*} io IO server variable
   * @param {*} config Config file reference variable
   * @param {*} logger Logger variable
   * @returns  `true` if OPCUA - client was created successfully, `false` otherwise
   */
  createOPCUAClient: async function (io, config, logger) {
    endpointUrl = config.endpointUrl;
    nodeIdKeys = Object.keys(config.nodeIds);

    client = OPCUAClient.create({
      securityMode: MessageSecurityMode.SignAndEncrypt,
      securityPolicy: SecurityPolicy.Basic256Sha256,
      endpointMustExist: false,
    });

    // setting actions on specific events
    client
      .on("backoff", (retry) => {
      logger.info("Retrying to connect to ", endpointUrl, " attempt ", retry);
      })
      .on("connection_failed", () => {
        logger.info(`Client failed to connect.`);
      })
      .on("connection_lost", () => {
        logger.info(`Client lost the connection.`);
      })
      .on("start_reconnection", () => {
        logger.info(`Client is starting the reconnection process.`);
      })
      .on("reconnection_attempt_has_failed", (_, message) => {
        logger.info(`Client reconnection attempt has failed: ${message}`);
      })
      .on("after_reconnection", () => {
        logger.info(`Client finished the reconnection process.`);
        create(io, config, logger);
        this.emitValues(io);
      })
      .on("close", () => {
        logger.info(`Client closed and disconnected`);
      })
      .on("timed_out_request", (request) => {
        logger.info(`Client request timed out: ${request.toString()}`);
      });

    logger.info("connecting to ", chalk.cyan(endpointUrl));
    await client.connect(endpointUrl);
    logger.info("connected to ", chalk.cyan(endpointUrl));

    // create Subscriptions, Sessions and monitored items
    return create(io, config, logger);
  },

  /**
   * Stopping the OPCUA - client by closing its subscriptions, sessions and disconnecting the client.
   */
  stopOPCUAClient: async function () {
    if (subscription) await subscription.terminate();
    if (session) await session.close();
    if (client) await client.disconnect();
  },

  /**
   * Emitting (sending) historical values of monitored items to web clients
   * @param {*} io IO server variable 
   * @param {*} config Config file reference variable
   * @param {*} logger Logger variable
   */
  emitHistoricalArrayValuesForLinecharts: async function (io, config, logger) { 
  // get historical data of linecharts in case of reconnect (either client connect or opcua reconnect)
  // the other values are emitted every config.emitInterval milliseconds either way, no need for old data or dataValueMemory
    logger.info("get and emit historical datavalues (array) for linecharts");
    if (client != null && nodeIdKeys != null) {
      nodeIdKeys.forEach((v, i) => {
        // linechart values as array
        if (config.nodeIds[v].csv) {
          let emittedValue = fileHandler.getLatestValues(fileHandler.getCurrentNodeIdFile(v, config), config.nodeIds[v].hoursRead, logger);
          if (emittedValue == -1) return; // do nothing if file not found (happens at first start of the day)

          io.sockets.emit(v, {
            value: emittedValue,
            // timestamp: null, // not used in the case of emitting arrays, see main.js
            currentTime: new Date()
          });
        }
      });
    }
  },

  /**
   * Storing log data (monitored items) in a csv file located in `config.logPath`. 
   * @param {*} config Config file reference variable
   * @param {*} logger Logger variable
   */
  storeLogData: function (config, logger) {
    logger.info("Storing log data");
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
    fileHandler.appendToCSV(filepath, content, logger);
  },

  /**
   * Create default folder hierarchy.
   * @param {*} config Config file reference variable
   */
  createFolderHierarchy: function(config) {
    fileHandler.createFolderHierarchy(config);
  }
}

/**
 * Creating subscriptions, sessions and monitored items.
 * @param {*} io IO server variable
 * @param {*} config Config file reference variable
 * @param {*} logger Logger variable
 * @returns 
 */
async function create(io, config, logger) {
  if (subscription) await subscription.terminate();
  
  if (session) {
    while (session._reconnecting.reconnecting){
      console.log("reconnecting before closing the session ...");
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 sec
    }
    await session.close();
  }

  if (!await createSession(config, logger)){
    return false;
  }

  await createSubscription(io, logger);

  await createMonitoringItems(config);

  await insertPreviousDatavalueForLinecharts(config, logger);

  intervalId = setInterval(() => { getAndEmitLiveDatavalues(io, config, logger) }, config.emitInterval);

  return true;
}

/**
 * Create monitoring items for each node id.  
 * @param {*} config Config file reference variable
 */
async function createMonitoringItems(config) {
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

/**
 * Create subscription with specific parameters.
 * @param {*} logger Logger variable
 */
async function createSubscription(logger) {
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
      logger.info(" SUBSCRIPTION KEEPALIVE ------------------------------->");
      // emitCurrentDataValues(io);
    })
    .on("terminated", function () {
      logger.info(" SUBSCRIPTION TERMINATED ------------------------------>");
      clearInterval(intervalId);
    })
    .on("error", function () {
      logger.error(" SUBSCRIPTION ERROR");
      clearInterval(intervalId);
    })
    .on("internal_error", function () {
      logger.error(" INTERNAL ERROR");
      clearInterval(intervalId);
    });
}

/**
 * Retrieve live values and emit them to the web client.
 * @param {*} io IO server variable
 * @param {*} config Config file reference variable
 * @param {*} logger Logger variable
 */
async function getAndEmitLiveDatavalues(io, config, logger) {
  logger.info("get & emit current data values");

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
      logger.info("fill missing values because of faulty session");

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

/**
 * Insert previous datavalue for linecharts for the web client.
 * @param {*} io IO server variable
 * @param {*} config Config file reference variable
 * @param {*} logger Logger variable
 */
async function insertPreviousDatavalueForLinecharts(io, config, logger) {
  // avoid the diagonal in the linecharts by adding a point immediately before we add the actual newest datavalue
  logger.info("insert and emit previous datavalue for linecharts");

  for (const nodeIdName of nodeIdKeys) {
    if (config.nodeIds[nodeIdName].csv) {
      const dataValue = await session.read({
        nodeId: config.nodeIds[nodeIdName].id,
        attributeId: AttributeIds.Value,
      });

      let emittedValue = fileHandler.getLatestValues(fileHandler.getCurrentNodeIdFile(nodeIdName, config), config.nodeIds[nodeIdName].hoursRead, logger);
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




