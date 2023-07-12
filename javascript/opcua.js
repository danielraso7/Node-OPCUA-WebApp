const config = require("../config/config.json");
const chalk = require("chalk");
const { AttributeIds, OPCUAClient, TimestampsToReturn } = require("node-opcua");
const csvReaderWriter = require("./csv");


const endpointUrl = config.endpointUrl;
//const endpointUrl = "opc.tcp://DESKTOP-H19DHJH:53530/OPCUA/SimulationServer";

let client, session, subscription;

let subscriptionParameters, nodeIdKeys, itemsToMonitor, monitoredItems, dataValueMemory = [];

module.exports = {

 createOPCUAClient: async function (io) {
    client = OPCUAClient.create({
      endpointMustExist: false,
    });
    client.on("backoff", (retry, delay) => {
      console.log("Retrying to connect to ", endpointUrl, " attempt ", retry);
    });
    console.log(" connecting to ", chalk.cyan(endpointUrl));
    await client.connect(endpointUrl);
    console.log(" connected to ", chalk.cyan(endpointUrl));
  
    session = await client.createSession();
    console.log(chalk.yellow(" session created"));
  
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
      });
  

    subscriptionParameters = {
      samplingInterval: 100,
      discardOldest: true,
      queueSize: 100,
    };

    nodeIdKeys = Object.keys(config.nodeIds);
    itemsToMonitor = [];
    for (const nodeId of nodeIdKeys) {
      itemsToMonitor.push({
        nodeId: config.nodeIds[nodeId].id,
        attributeId: AttributeIds.Value,
      });
    }

    monitoredItems = await subscription.monitorItems(itemsToMonitor, subscriptionParameters, TimestampsToReturn.Both);

    
    monitoredItems.on("changed", (monitoredItem, dataValue, index) => {
      dataValueMemory[index] = dataValue;
      // use "csv" property to determine if we need to write to a csv file
      // either way: use io.socket.emit
      // param "index" corresponds to the correct entry in config.json bc we added the nodeIds (itemToMonitor) to the subscription in the same order as they are in config.json
      if (config.nodeIds[nodeIdKeys[index]].csv) {
        console.log("create or update csv file");
        let entry =
            "" +
            dataValue.value.value +
            ";" +
            Date.parse(dataValue.sourceTimestamp) +
            ";" +
            Date(Date.parse(dataValue.sourceTimestamp)) +
            "\n";
        csvReaderWriter.appendToCSV(`./csv/${getCurrentDateAsFolderName()}/${nodeIdKeys[index]}.csv`, entry);
      }

      io.sockets.emit(nodeIdKeys[index], {
        value: dataValue.value.value,
        timestamp: Date(Date.parse(dataValue.sourceTimestamp)),
        // browseName: "Temperature",
      });

      // console.log(monitoredItem.itemToMonitor.nodeId.value);
      // console.log(dataValue.value.value);
      // console.log(Date(Date.parse(dataValue.sourceTimestamp)));
    });

  },
  
  stopOPCUAClient: async function () {
    if (subscription) await subscription.terminate();
    if (session) await session.close();
    if (client) await client.disconnect();
  },

  emitValues: async function (io) {
    if(client != null && nodeIdKeys != null) {
      for(i = 0; i < nodeIdKeys.length; i++) {
        io.sockets.emit(nodeIdKeys[i], {
          value: dataValueMemory[i].value.value,
          timestamp: Date(Date.parse(dataValueMemory[i].sourceTimestamp))
        });

        // console.log(nodeIdKeys[i]);
        // console.log(dataValueMemory[i].value.value);
        // console.log(Date(Date.parse(dataValueMemory[i].sourceTimestamp)));
      }
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