const express = require("express");
const chalk = require("chalk");
const http = require("http");
const { Server } = require("socket.io");
const opcua = require("./opcua");
const config = require("./config/config.json");

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

    const io = new Server(server);
    io.sockets.on("connection", function (socket) {console.log("Client connected to server!")});

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
