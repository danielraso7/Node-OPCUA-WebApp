const express = require("express");
const chalk = require("chalk");
const http = require("http");
const { Server } = require("socket.io");
const opcua = require("./javascript/opcua");
const config = require("./config/config.json");
const csvReaderWriter = require("./javascript/csv");

(async () => {
  try {
    // --------------------------------------------------------
    const app = express();
    app.set("view engine", "html");
    app.use(express.static(__dirname + "/"));
    app.set("views", __dirname + "/");
    app.get("/", function (req, res) {
      res.render("index.html");
    });

    const server = http.createServer(app);
    server.listen(config.port, () => {
        console.log("Listening on port " + config.port);
        console.log("visit http://localhost:" + config.port);
    });

    server.on("error", () => {
      console.log("Error has happened");
    })
    .on("warning", () => {
      console.log("Warning has happened");
    })
    .on("internal_error", () => {
      console.log("Internal error happened");
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

    const io = new Server(server);
    io.sockets.on("connection", function (socket) {
      console.log("Client connected to server!");
      opcua.emitValues(io);
    });

    // --------------------------------------------------------
    opcua.createOPCUAClient(io);

    // detect CTRL+C and close
    process.once("SIGINT", async () => {
      console.log("shutting down client");

      await opcua.stopOPCUAClient();
      console.log("Done");
      process.exit(0);
    });
  } catch (err) {
    console.log(chalk.bgRed.white("Error" + err.message));
    console.log(err);
    process.exit(-1);
  }
})();
