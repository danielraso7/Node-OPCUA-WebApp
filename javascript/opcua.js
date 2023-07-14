const config = require("../config/config.json");
const chalk = require("chalk");
const { AttributeIds, OPCUAClient, TimestampsToReturn } = require("node-opcua");
const csvReaderWriter = require("./csv");


const endpointUrl = config.endpointUrl;
//const endpointUrl = "opc.tcp://DESKTOP-H19DHJH:53530/OPCUA/SimulationServer";

let client, session, subscription;

let dataValueMemory = [];
const nodeIdKeys = Object.keys(config.nodeIds);

module.exports = {

  createOPCUAClient: async function (io) {
    client = OPCUAClient.create({
      endpointMustExist: false,
    });
    client.on("backoff", (retry, delay) => {
      console.log("Retrying to connect to ", endpointUrl, " attempt ", retry);
    })
    .on("connection_failed", () => {
      console.log(`Client failed to connect.`);
    })
    .on("connection_lost", () => {
        console.log(`Client lost the connection.`);
    })
    .on("start_reconnection", () => {
        console.log(`Client is starting the reconnection process.`);
    })
    .on("reconnection_attempt_has_failed", (_, message) => {
        console.log(`Client reconnection attempt has failed: ${message}`);
    })
    .on("after_reconnection", () => {
        console.log(`Client finished the reconnection process.`);
        this.create(io);
        this.emitValues(io);
    })
    .on("close", () => {
        console.log(`Client closed and disconnected`);
    })
    .on("timed_out_request", (request) => {
        console.log(`Client request timed out: ${request.toString()}`);
    });
    console.log(" connecting to ", chalk.cyan(endpointUrl));
    await client.connect(endpointUrl);
    console.log(" connected to ", chalk.cyan(endpointUrl));

    //session = await client.createSession();
    //console.log(chalk.yellow(" session created"));
    this.create(io);

    /*subscription = await session.createSubscription2({
      requestedPublishingInterval: 250,
      requestedMaxKeepAliveCount: 50,
      requestedLifetimeCount: 6000,
      maxNotificationsPerPublish: 1000,
      publishingEnabled: true,
      priority: 10,
    });

    subscription
      .on("keepalive", function () {
        console.log(" SUBSCRIPTION KEEPALIVE ------------------------------->");
      })
      .on("terminated", function () {
        console.log(" SUBSCRIPTION TERMINATED ------------------------------>");
      })
      .on("error", function () {
        console.log(" SUBSCRIPTION ERROR");
      })
      .on("internal_error", function () {
        console.log(" INTERNAL ERROR");
      })
      .on("keepalive_failure", (state) => {
        console.log(
            `Session encountered a keepalive error: ${state !== undefined ? state.toString() : "No state provided."}`
        );
      })
      .on("reconnection_attempt_has_failed", (_, message) => {
        console.log(`Client reconnection attempt has failed: ${message}`);
      })
      .on("start_reconnection", () => {
        console.log(`Client is starting the reconnection process.`);
      });


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

    monitoredItems.on("changed", (monitoredItem, dataValue, index) => {
      dataValueMemory[index] = dataValue;
      // use "csv" property to determine if we need to write to a csv file
      // either way: use io.socket.emit
      // param "index" corresponds to the correct entry in config.json bc we added the nodeIds (itemToMonitor) to the subscription in the same order as they are in config.json
      if (config.nodeIds[nodeIdKeys[index]].csv) {
            entry =
              "" +
              dataValue.value.value +
              ";" +
              Date.parse(dataValue.sourceTimestamp) +
              ";" +
              new Date(Date.parse(dataValue.sourceTimestamp)) +
              "\n";
          csvReaderWriter.appendToCSV(`./csv/${getCurrentDateAsFolderName()}/${nodeIdKeys[index]}.csv`, entry);
      }

      io.sockets.emit(nodeIdKeys[index], {
        value: dataValue.value.value,
        timestamp: Date.parse(dataValue.sourceTimestamp),
        currentTime: new Date()
      });

        //console.log(nodeIdKeys[index]);
        //console.log(dataValue.value.value);
        //console.log(new Date(Date.parse(dataValue.sourceTimestamp)));
    });*/

  },

  createSession: async function () {
    session = await client.createSession();
    console.log(chalk.yellow(" session created"));
  },

  createSubscription: async function() {
    subscription = await session.createSubscription2({
      requestedPublishingInterval: 250,
      requestedMaxKeepAliveCount: 50,
      requestedLifetimeCount: 6000,
      maxNotificationsPerPublish: 1000,
      publishingEnabled: true,
      priority: 10,
    });

    subscription
      .on("keepalive", function () {
        console.log(" SUBSCRIPTION KEEPALIVE ------------------------------->");
      })
      .on("terminated", function () {
        console.log(" SUBSCRIPTION TERMINATED ------------------------------>");
      })
      .on("error", function () {
        console.log(" SUBSCRIPTION ERROR");
      })
      .on("internal_error", function () {
        console.log(" INTERNAL ERROR");
      })
      .on("keepalive_failure", (state) => {
        console.log(
            `Session encountered a keepalive error: ${state !== undefined ? state.toString() : "No state provided."}`
        );
      })
      .on("reconnection_attempt_has_failed", (_, message) => {
        console.log(`Client reconnection attempt has failed: ${message}`);
      })
      .on("start_reconnection", () => {
        console.log(`Client is starting the reconnection process.`);
      });
  },

  createMonitoringItems: async function (io) {
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

    monitoredItems.on("changed", (monitoredItem, dataValue, index) => {
      dataValueMemory[index] = dataValue;
      // use "csv" property to determine if we need to write to a csv file
      // either way: use io.socket.emit
      // param "index" corresponds to the correct entry in config.json bc we added the nodeIds (itemToMonitor) to the subscription in the same order as they are in config.json
      if (config.nodeIds[nodeIdKeys[index]].csv) {
            entry =
              "" +
              dataValue.value.value +
              ";" +
              Date.parse(dataValue.sourceTimestamp) +
              ";" +
              new Date(Date.parse(dataValue.sourceTimestamp)) +
              "\n";
          csvReaderWriter.appendToCSV(`./csv/${getCurrentDateAsFolderName()}/${nodeIdKeys[index]}.csv`, entry);
      }

      io.sockets.emit(nodeIdKeys[index], {
        value: dataValue.value.value,
        timestamp: Date.parse(dataValue.sourceTimestamp),
        currentTime: new Date()
      });

        //console.log(nodeIdKeys[index]);
        //console.log(dataValue.value.value);
        //console.log(new Date(Date.parse(dataValue.sourceTimestamp)));
    });
  },

  create: async function(io) {   
    if (subscription) await subscription.terminate();
    if (session) await session.close(); 
    
    await this.createSession();

    await this.createSubscription();

    this.createMonitoringItems(io);
  },

  stopOPCUAClient: async function () {
    if (subscription) await subscription.terminate();
    if (session) await session.close();
    if (client) await client.disconnect();
  },

  emitValues: async function (io) {
    if (client != null && nodeIdKeys != null && dataValueMemory.length != 0) {
      nodeIdKeys.forEach((v, i) => {
        // boolean or int values
        let emittedValue = dataValueMemory[i].value.value;

        // linechart values as array
        if (config.nodeIds[v].csv) {
          let csvData = csvReaderWriter.readCSV(`./csv/${getCurrentDateAsFolderName()}/${v}.csv`);
          if (config.nodeIds[v].hoursRead == 24) {
            // we simply return the entire file data and not the "real" last 24 hours
            emittedValue = [...csvData];
          } else {
            // [0] value, [1] timestamp in ms
            let cutoffTime = Date.now() - 3600000 * config.nodeIds[v].hoursRead;

            let cutoffIndex = 0;
            for (let i = csvData.length - 1; i > 0; i--) {
              if (csvData[i][1] < cutoffTime) {
                cutoffIndex = i + 1;
                break;
              }
            }
            emittedValue = [...csvData.slice(cutoffIndex, csvData.length)];
          }
        }

        io.sockets.emit(v, {
          value: emittedValue,
          timestamp: Date.parse(dataValueMemory[i].sourceTimestamp),
          currentTime: new Date()
        });

        // console.log(v);
        // console.log(dataValueMemory[i].value.value);
        // console.log(new Date(Date.parse(dataValueMemory[i].sourceTimestamp)));
      });
    }
  }
}

function getCurrentDateAsFolderName() {
  let d = new Date(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [day, month, year].join('_');
}