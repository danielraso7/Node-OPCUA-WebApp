const config = require("../config/config.json");
const chalk = require("chalk");
const { AttributeIds, OPCUAClient, TimestampsToReturn } = require("node-opcua");

const endpointUrl = config.endpointUrl;
//const endpointUrl = "opc.tcp://DESKTOP-H19DHJH:53530/OPCUA/SimulationServer";

let client, session, subscription;

let stromBesaeumer1Value, stromBesaeumer2Value, istStückzahlValue, geschMitnehmerfoerdererValue, anlageStoerungValue, anlageRuestenValue, anlageAutomatikValue, anlageHandValue;

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
  

    const subscriptionParameters = {
      samplingInterval: 100,
      discardOldest: true,
      queueSize: 100,
    };

    const itemsToMonitor = [];

    for (const nodeId in config.nodeIds) {
      itemsToMonitor.push({
        nodeId: config.nodeIds[nodeId],
        attributeId: AttributeIds.Value,
      });
    }

    const monitoredItems = await subscription.monitorItems(itemsToMonitor, subscriptionParameters, TimestampsToReturn.Both);

    monitoredItems.on("changed", (monitoredItem, dataValue, index) => {
        console.log("CHANGE");
        console.log(monitoredItem.itemToMonitor.nodeId.value);
        console.log(dataValue.value.value);
        console.log(Date(Date.parse(dataValue.sourceTimestamp)));
    });

  },
  
  stopOPCUAClient: async function () {
    if (subscription) await subscription.terminate();
    if (session) await session.close();
    if (client) await client.disconnect();
  }

}

exports.stromBesaeumer1 = stromBesaeumer1Value;
exports.stromBesaeumer2 = stromBesaeumer2Value;
exports.istStückzahl = istStückzahlValue;
exports.geschMitnehmerfoerderer = geschMitnehmerfoerdererValue;
exports.anlageStoerung = anlageStoerungValue;
exports.anlageRuesten = anlageRuestenValue;
exports.anlageAutomatik = anlageAutomatikValue;
exports.anlageHand = anlageHandValue;