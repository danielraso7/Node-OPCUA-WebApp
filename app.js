const express = require("express");
const chalk = require("chalk");
const http = require("http");
const { Server } = require("socket.io");
const opcua = require("./javascript/opcua");
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

    server.on("error", () => {
      console.log("Error has happened");
    })
    .on("warning", () => {
      console.log("Warning has happened");
    })
    .on("internal_error", () => {
      console.log("Internal error happened");
    });

    const io = new Server(server);
    io.sockets.on("connection", function () {
      console.log("Client connected to server!");
      opcua.emitValues(io);
    });

    // --------------------------------------------------------
    opcua.createOPCUAClient(io);

    // run everyday at 11 pm
    runAtSpecificTimeOfDay(23,0,() => { opcua.storeLogData();});

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

function runAtSpecificTimeOfDay(hour, minutes, func)
{
  const twentyFourHours = 86400000;
  const now = new Date();
  let eta_ms = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes, 0, 0).getTime() - now;
  if (eta_ms < 0)
  {
    eta_ms += twentyFourHours;
  }
  setTimeout(function() {
    //run once
    func();
    // run every 24 hours from now on
    setInterval(func, twentyFourHours);
  }, eta_ms);
}