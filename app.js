const express = require("express");
const chalk = require("chalk");
const http = require("http");
const { Server } = require("socket.io");
const opcua = require("./javascript/opcua");
const config = require("./config/config.json");
const puppeteer = require('puppeteer');
const fileHandler = require('./javascript/file');

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
      opcua.emitHistoricalArrayValuesForLinecharts(io);
    });

    // set up folder hierarchy (if not existent)
    opcua.createFolderHierarchy();

    // --------------------------------------------------------
    if (! await opcua.createOPCUAClient(io)) {
      await shutDownOPCUAClient();
    }

    // run everyday at 11 pm
    runAtSpecificTimeOfDay(23, 49, () => {
      opcua.storeLogData();
      screenShotWebsite(`${config.logPath}/${fileHandler.getCurrentDateAsFolderName()}/`, fileHandler.getCurrentDateAsFolderName() + '_screenshot.png');
    });

    // detect CTRL+C and close
    process.once("SIGINT", async () => {
      await shutDownOPCUAClient();
    });


    // storing screenshot and pdf
    //await screenShotWebsite(`${config.logPath}/${fileHandler.getCurrentDateAsFolderName()}/`, fileHandler.getCurrentDateAsFolderName() + '_screenshot.png');
  } catch (err) {
    console.log(chalk.bgRed.white("Error" + err.message));
    console.log(err);
    process.exit(-1);
  }
})();

async function shutDownOPCUAClient() {
  console.log("shutting down client");

  await opcua.stopOPCUAClient();
  console.log("Done");
  process.exit(0);
}

function runAtSpecificTimeOfDay(hour, minutes, func) {
  const twentyFourHours = 86400000;
  const now = new Date();
  let eta_ms = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minutes, 0, 0).getTime() - now;
  if (eta_ms < 0) {
    eta_ms += twentyFourHours;
  }
  setTimeout(function () {
    //run once
    func();
    // run every 24 hours from now on
    setInterval(func, twentyFourHours);
  }, eta_ms);
}

async function screenShotWebsite(path, filename) {
  fileHandler.createPathIfNotExists(path);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Replace 'https://example.com' with the URL of the website you want to take a screenshot of
  const websiteURL = 'http://localhost:3700/';
  await page.goto(websiteURL, { waitUntil: 'networkidle2' });

  // Customize screenshot options
  const screenshotOptions = {
    path: path + filename, // Output path for the screenshot image
    fullPage: true, // Set to true to capture the full page
    // You can also set width and height options to capture a specific viewport size:
    // width: 1200,
    // height: 800,
  };

  // Take a screenshot
  await page.screenshot(screenshotOptions);

  // Customize PDF options
  const pdfOptions = {
    path: 'website_screenshot.pdf', // Output path for the PDF
    format: 'A4', // Paper format: 'A4', 'Letter', etc.
    landscape: true, // Set to true for landscape orientation
  };

  // Generate the PDF from the screenshot image
  await page.pdf(pdfOptions);

  await browser.close();
  console.log('Screenshot taken and PDF generated successfully.');
}