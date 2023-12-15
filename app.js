// exe build command: nexe app.js -t "windows-x64" -r "src/**/*" --build --name "OPC_Client_App"

const express = require("express");
const logger = require("./src/javascript/logger");
const chalk = require("chalk");
const http = require("http");
const { Server } = require("socket.io");
const opcua = require("./src/javascript/opcua");
const puppeteer = require('puppeteer');
const fileHandler = require('./src/javascript/file');

// read config file
let config = fileHandler.readConfig("./config.json");

// "main"
(async () => {
  // console.log("App started", new Date(Date.now()));
  logger.info("App started", new Date(Date.now()));
  mainLoop();
})();

// (async () => {
/**
 * Main logic happening in here including setting up parameters, starting services and triggers.
 */
async function mainLoop() {
  try {
    // --------------------------------------------------------
    const app = express();
    app.set("view engine", "html");
    app.use(express.static(__dirname + "/src/"));
    app.set("views", __dirname + "/src/");
    app.get("/", function (req, res) {
      res.render("index.html");
    });
    
    app.locals.host = {
      url: config.windows.url + ":" + config.port
    }

    // ------ setting up the web server ------
    const server = http.createServer(app);
    
    // make sure this server doesn't keep the process running
    server.unref();

    // setting some actions on specific events
    server.listen(config.port, () => {
      logger.info("Listening on port " + config.port);
      logger.info("visit http://" + config.windows.url + ":" + config.port);
    });

    // setting some actions on specific events
    server.on("error", (e) => {
      logger.error("Error has happened");
      if (e.code === "EADDRINUSE") {
        logger.error("Server already running - can't run more than one instance");
        process.exit(1);
      } else {
        logger.error(e);
      }
    })
      .on("warning", () => {
        logger.error("Warning has happened");
    })
      .on("internal_error", () => {
        logger.error("Internal error happened");
    });

    const io = new Server(server);
    io.sockets.on("connection", function () {
      logger.info("Client connected to server!");
      opcua.emitHistoricalArrayValuesForLinecharts(io, config, logger);
    });

    // set up folder hierarchy (if not existent)
    opcua.createFolderHierarchy(config);

    // creating OPCUA - client
    if (! await opcua.createOPCUAClient(io, config, logger)) {
      await shutDownOPCUAClient();
    }

    // run everyday at 11 pm
    runAtSpecificTimeOfDay(23, 0, () => {
      opcua.storeLogData(config. logger);
      screenShotWebsite(`${config.logPath}/${fileHandler.getCurrentDateAsFolderName()}/`, fileHandler.getCurrentDateAsFolderName() + '_screenshot.png');
    });

    // detect CTRL+C and close
    process.once("SIGINT", async () => {
      await shutDownOPCUAClient();
    });
  } catch (err) {
    logger.error("Error" + err.message);
    logger.error(err);
    process.exit(-1);
  }
}

/**
 * Shutting down the OPCUA - client
 */
async function shutDownOPCUAClient() {
  logger.info("shutting down client");

  await opcua.stopOPCUAClient();
  logger.info("Done");
  process.exit(0);
}

/**
 * Run a passed function at a certain time every day.
 * @param {Integer} hour Hours in 0-24
 * @param {Integer} minutes Minutes in 0-60
 * @param {*} func Function to be called at a specific time of the day
 */
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

/**
 * Take a screenshot of the web page and store it in the specified folder.
 * 
 * Uncommenting the following line enables screenshot to PDF:
 * ```
 * await page.pdf(pdfOptions);
 * ```
 * 
 * @param {String} path Path to the file to be stored
 * @param {String} filename Name of the screenshot file to be stored
 */
async function screenShotWebsite(path, filename) {
  // doScreenshots is set in config.json the screenshots are done
  if(config.doScreenshots) {
    fileHandler.createPathIfNotExists(path, logger);

    // const browser = await puppeteer.launch();
    // const browser = await puppeteer.launch({executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
    // const browser = await puppeteer.launch({executablePath: 'C:\\OPC_Client2\\chrome-win\\chrome.exe'});
    const browser = await puppeteer.launch({executablePath: 'chrome-win\\chrome.exe'});
    const page = await browser.newPage();

    // Replace 'https://example.com' with the URL of the website you want to take a screenshot of
    const websiteURL = 'http://localhost:3700/';
    await page.goto(websiteURL, { waitUntil: 'networkidle2' });

    // Customize screenshot options
    const screenshotOptions = {
      path: path + filename, // Output path for the screenshot image
      fullPage: true, // Set to true to capture the full page
      // You can also set width and height options to capture a specific viewport size:
      // width: 1600,
      // height: 1200,
    };

    // Take a screenshot
    await page.screenshot(screenshotOptions);
    
    // Customize PDF options
    const pdfOptions = {
      path: path + 'website_screenshot.pdf', // Output path for the PDF
      format: 'A4', // Paper format: 'A4', 'Letter', etc.
      landscape: true, // Set to true for landscape orientation
    };

    // Generate the PDF from the screenshot image
    await page.pdf(pdfOptions);
    
    await browser.close();
    // console.log('Screenshot taken and PDF generated successfully.');
    logger.info('Screenshot taken and PDF generated successfully.');
  }
}