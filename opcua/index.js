const config = require("../config");

const chalk = require("chalk");

const { AttributeIds, OPCUAClient, TimestampsToReturn } = require("node-opcua");

const hostname = require("os").hostname().toLowerCase();
const endpointUrl = config.configValues.endpointUrl; //"opc.tcp://192.168.10.14:4840";
//const endpointUrl = "opc.tcp://DESKTOP-H19DHJH:53530/OPCUA/SimulationServer";
//const nodeIdToMonitor = 'ns=3;s="Betriebsdaten"."Betriebsdaten"."StromBesaeumer1"';
//const nodeIdToMonitor2 = 'ns=3;s="Betriebsdaten"."Betriebsdaten"."StromBesaeumer2"';
//const nodeIdToMonitor = "ns=3;i=1002";

let client, session, subscription;

var stromBesaeumer1Value, stromBesaeumer2Value, istStückzahlValue, geschMitnehmerfoerdererValue, anlageStoerungValue, anlageRuestenValue, anlageAutomatikValue, anlageHandValue;

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
        console.log("keepaliveeee");
        //console.log(subscription)
      })
      .on("terminated", function () {
        console.log(" TERMINATED ------------------------------>");
      });
  
    const itemToMonitor = {
      nodeId: config.configValues.stromBesaeumer1,
      attributeId: AttributeIds.Value,
    };
    const parameters = {
      samplingInterval: 100,
      discardOldest: true,
      queueSize: 100,
    };
    const monitoredItem = await subscription.monitor(
      itemToMonitor,
      parameters,
      TimestampsToReturn.Both
    );
  
    monitoredItem.on("changed", (dataValue) => {
        console.log("stromBesaeumer1");
        stromBesaeumer1Value = dataValue.value.value;
        //console.log(dataValue);
        console.log(dataValue.value.value);
        console.log(Date(Date.parse(dataValue.sourceTimestamp)));
        /*io.sockets.emit("message", {
        value: dataValue.value.value,
        timestamp: dataValue.serverTimestamp,
        nodeId: nodeIdToMonitor,
        browseName: "Temperature",
      });*/
    });

    const itemToMonitor2 = {
      nodeId: config.configValues.stromBesaeumer2,
      attributeId: AttributeIds.Value,
    };
    const monitoredItem2 = await subscription.monitor(
      itemToMonitor2,
      parameters,
      TimestampsToReturn.Both
    );  
    monitoredItem2.on("changed", (dataValue) => {
        console.log("stromBesaeumer2");
        stromBesaeumer2Value = dataValue.value.value;
        //console.log(dataValue);
        console.log(dataValue.value.value);
        console.log(Date(Date.parse(dataValue.sourceTimestamp)));
    });

    const itemToMonitor3 = {
      nodeId: config.configValues.istStückzahl,
      attributeId: AttributeIds.Value,
    };
    const monitoredItem3 = await subscription.monitor(
      itemToMonitor3,
      parameters,
      TimestampsToReturn.Both
    );  
    monitoredItem3.on("changed", (dataValue) => {
        console.log("istStückzahl");
        istStückzahlValue = dataValue.value.value;
        //console.log(dataValue);
        console.log(dataValue.value.value);
        console.log(Date(Date.parse(dataValue.sourceTimestamp)));
    });

    const itemToMonitor4 = {
      nodeId: config.configValues.geschMitnehmerfoerderer,
      attributeId: AttributeIds.Value,
    };
    const monitoredItem4 = await subscription.monitor(
      itemToMonitor4,
      parameters,
      TimestampsToReturn.Both
    );  
    monitoredItem4.on("changed", (dataValue) => {
        console.log("geschMitnehmerfoerderer");
        geschMitnehmerfoerdererValue = dataValue.value.value;
        //console.log(dataValue);
        console.log(dataValue.value.value);
        console.log(Date(Date.parse(dataValue.sourceTimestamp)));
    });

    const itemToMonitor5 = {
      nodeId: config.configValues.anlageStoerung,
      attributeId: AttributeIds.Value,
    };
    const monitoredItem5 = await subscription.monitor(
      itemToMonitor5,
      parameters,
      TimestampsToReturn.Both
    );  
    monitoredItem5.on("changed", (dataValue) => {
        console.log("anlageStoerung");
        anlageStoerungValue = dataValue.value.value;
        //console.log(dataValue);
        console.log(dataValue.value.value);
        console.log(Date(Date.parse(dataValue.sourceTimestamp)));
    });

    const itemToMonitor6 = {
      nodeId: config.configValues.anlageRuesten,
      attributeId: AttributeIds.Value,
    };
    const monitoredItem6 = await subscription.monitor(
      itemToMonitor6,
      parameters,
      TimestampsToReturn.Both
    );  
    monitoredItem6.on("changed", (dataValue) => {
        console.log("anlageRuesten");
        anlageRuestenValue = dataValue.value.value;
        //console.log(dataValue);
        console.log(dataValue.value.value);
        console.log(Date(Date.parse(dataValue.sourceTimestamp)));
    });

    const itemToMonitor7 = {
      nodeId: config.configValues.anlageAutomatik,
      attributeId: AttributeIds.Value,
    };
    const monitoredItem7 = await subscription.monitor(
      itemToMonitor7,
      parameters,
      TimestampsToReturn.Both
    );  
    monitoredItem7.on("changed", (dataValue) => {
        console.log("anlageAutomatik");
        anlageAutomatikValue = dataValue.value.value;
        //console.log(dataValue);
        console.log(dataValue.value.value);
        console.log(Date(Date.parse(dataValue.sourceTimestamp)));
    });

    const itemToMonitor8 = {
      nodeId: config.configValues.anlageHand,
      attributeId: AttributeIds.Value,
    };
    const monitoredItem8 = await subscription.monitor(
      itemToMonitor8,
      parameters,
      TimestampsToReturn.Both
    );  
    monitoredItem8.on("changed", (dataValue) => {
        console.log("anlageHand");
        anlageHandValue = dataValue.value.value;
        //console.log(dataValue);
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