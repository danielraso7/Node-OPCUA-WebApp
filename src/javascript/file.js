const fs = require('fs');
const logger = require('./logger_outer');

module.exports = {

    /**
     * Read the data of the config file (in case it does not exist, it copies the default config file to `configPath`) and returns it.
     * @param {String} configPath File path of the config file
     * @param {*} logger Logger variable
     * @returns Config file reference variable (data variable)
     */
    readConfig: (configPath, logger) => {
        if(!fs.existsSync(configPath)){
            fs.copyFileSync("./src/config_default.json", configPath);
            logger.info("Default config.json created!");
        } else {
            console.log("already there");
        }

        let config = JSON.parse(fs.readFileSync(configPath));
        return config;
    },

    /**
     * Create folders for a file path in case they do not exist yet.
     * @param {String} path File path
     * @param {*} logger Logger variable
     */
    createPathIfNotExists(path, logger){
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path);
            logger.info("Created path: " + path );
        }
    },

    /**
     * Store the `value` of `nodeIdName` in the corresponding csv file. Only store the value if the 'csv' property of the config file is set.
     * @param {String} nodeIdName Node name
     * @param {*} value Value to be stored
     * @param {*} timestep Time stamp when the value has occured
     * @param {*} config Config file reference variable
     */
    storeValueInCSVBasedOnConfig(nodeIdName, value, timestep, config) {
        // use "csv" property to determine if we need to write to a csv file
        // either way: use io.socket.emit
        // param "index" corresponds to the correct entry in config.json bc we added the nodeIds (itemToMonitor) to the subscription in the same order as they are in config.json
        if (config.nodeIds[nodeIdName].csv) {
            let entry = "" + value + ";" + Date.parse(timestep) + ";" + new Date(Date.parse(timestep)) + "\n";
            module.exports.appendToCSV(module.exports.getCurrentNodeIdFile(nodeIdName, config), entry, logger);
        }
    },

    /**
     * Append `content` to a csv file. Returns `true` in case an error appeared.
     * @param {String} filepath File path to file
     * @param {String} content Content to be appended
     * @param {*} logger Logger variable
     * @returns `false` in case there is no error, `true` otherwise.
     */
    appendToCSV: (filepath, content, logger) => {
        //logger.info("writing to " + filepath);
        let folderRelPath = filepath.slice(0, filepath.lastIndexOf("/"));
        if (!fs.existsSync(folderRelPath)) {
            fs.mkdirSync(folderRelPath);
        }
        let error = false;
        fs.appendFile(filepath, content, (err) => {
            if (err) {
                logger.error(err);
                error = true;
            }
        });
        return error;
    },

    /**
     * Read all values of a csv file and return it as an array.
     * @param {String} filepath File path to csv file of monitored item
     * @param {*} logger Logger variable
     * @returns All values of a specific csv file as an array
     */
    readCSV: (filepath, logger) => {
        //logger.info("reading from " + filepath)
        let data = fs.readFileSync(filepath)
            .toString() // convert Buffer to string
            .split('\n') // split string to lines
            .map(e => e.trim()) // remove white spaces for each line
            .map(e => e.slice(0, e.lastIndexOf(";"))) // remove the readable timestamp column from csv as its not needed here
            .map(e => e.split(';').map(e => e.trim())); // split each line to array
        return data.slice(0, data.length - 1) // - 1 because the last line is an empty line;
    },

    /**
     * Return the values of the csv file between `hoursRead` hours ago and now.
     * @param {String} filepath File path to csv file of monitored item
     * @param {Integer} hoursRead
     * @param {*} logger Logger variable
     * @returns Values of csv file between `hoursRead` hours ago and now
     */
    getLatestValues: (filepath, hoursRead, logger) => {
        let csvData = module.exports.readCSV(filepath, logger);
        if (hoursRead == 24) {
            // we simply return the entire file data and not the "real" last 24 hours
            return [...csvData];
        } else {
            // [0] value, [1] timestamp in ms
            let cutoffTime = Date.now() - 3600000 * hoursRead;

            let cutoffIndex = 0;
            for (let i = csvData.length - 1; i > 0; i--) {
                if (csvData[i][1] < cutoffTime) {
                cutoffIndex = i + 1;
                break;
                }
            }
            return [...csvData.slice(cutoffIndex, csvData.length)];
          
        }
    },

    /**
     * Delete csv file.
     * @param {String} filepath file path of file to be deleted
     * @param {*} logger Logger variable
     */
    deleteCSV: (filepath, logger) => {
        if (fs.existsSync(filepath)) {
            fs.unlink(filepath, (err) => {
                if (err) {
                    throw err;
                }

                logger.info(`Deleted ${filepath} successfully.`);
            });
        }
    },

    /**
     * create default folder hierarchy (currently only log path)
     * @param {*} config Config file reference variable
     */
    createFolderHierarchy: (config) => {
        if (!fs.existsSync(config.logPath)) {
            fs.mkdirSync(config.logPath);
        }
        // if (!fs.existsSync(`${config.logPath}/screenshots`)) {
        //     fs.mkdirSync(`${config.logPath}/screenshots`);
        // }
        logger.info("Initial Folder Hierarchy created!");
    },

    /**
     * Create default JSON config file if it does not exist.
     */
    createDefaultJSONConfigIfNotExistent: () => {
        if(!fs.existsSync("./config.json")){
            fs.copyFile("./src/config.default.json", "./config.json", (err) => {
                if (err) throw err;
                logger.info("Default config.json created!");
            });
        } else {
            logger.info("Config file already existent!");
        }
    },

    /**
     * Return the path to the csv file corresponding to the node name.
     * @param {String} nodeIdName name of the node id
     * @param {*} config Config file reference variable
     * @returns path to file / file name
     */
    getCurrentNodeIdFile(nodeIdName, config){
        return `${config.logPath}/${module.exports.getCurrentDateAsFolderName()}/${nodeIdName}.csv`
    },

    /**
     * Helper method to return the current date in the following form: YYYY_MM_DD
     * @returns current date in YYYY_MM_DD 
     */
    getCurrentDateAsFolderName() {
        let d = new Date(),
          month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();
      
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
      
        return [year, month, day].join('_');
      }
}