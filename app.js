const express = require("express");
const chalk = require("chalk");
const http = require("http");
const { Server } = require("socket.io");
const opcua = require("./opcua");
const port = 3700;

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
    app.use(express.static(__dirname + "/"));

    const server = http.createServer(app);

    const io = new Server(server);
    io.sockets.on("connection", function (socket) {});

    server.listen(port, () => {
      console.log("Listening on port " + port);
      console.log("visit http://localhost:" + port);
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
