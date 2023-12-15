// nexe "outer_app.js" -t "windows-x64" -r "src/javascript/file.js" --build --name "OPC_Client"

const { exit } = require('process');
const logger = require("./src/javascript/logger_outer");
var attempts = 5;

// "main"
(async () => {
  runInfinite();

  runAtSpecificTimeOfDay2(23, 5, () => {
    resetCounter();
    //screenShotWebsite(`${config.logPath}/${fileHandler.getCurrentDateAsFolderName()}/`, fileHandler.getCurrentDateAsFolderName() + '_screenshot.png');
  });
})();

/**
 * An infinite function which executes the OPC_Client_App infinitely. In case an error happens, it logs the error into an log-file.
 * In case the execution is terminated it restarts the app `attempts`-times until it closes the application.
 */
async function runInfinite() {
  var childProcess = require('child_process');

  // a sub process is started which runs the OPC application itself
  var ls = childProcess.exec('OPC_Client_App.exe', function (error, stdout, stderr) {
    if (error) {
      logger.error(error.stack);
      logger.error('Error code: ' + error.code);
      logger.error('Signal received: ' + error.signal);
    }

    console.log('Child Process STDOUT: ' + stdout);
    console.log('Child Process STDERR: ' + stderr);
  });

  ls.stdout.on('data', (data) => {
    console.log(`child stdout: ${data}`);
  });
  
  ls.stderr.on('data', (data) => {
    console.error(`child stderr: ${data}`);
  });

  ls.on('exit', function (code) {
    logger.info('Child process exited with exit code ' + code);
    attempts--;
    if (attempts > 0) {
      logger.info(attempts + ' attempts left');
      runInfinite();
    }
    else {
      logger.info('No more attempts left');
      process.exit(0);
    }
  });
}

function resetCounter() {
  attempts = 5;
}

/**
 * Run a passed function at a certain time every day.
 * @param {Integer} hour Hours in 0-24
 * @param {Integer} minutes Minutes in 0-60
 * @param {*} func Function to be called at a specific time of the day
 */
function runAtSpecificTimeOfDay2(hour, minutes, func) {
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