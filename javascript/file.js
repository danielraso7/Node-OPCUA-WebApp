const fs = require('fs');

module.exports = {
    storeValueInCSVBasedOnConfig(nodeIdName, value, timestep, config) {
        // use "csv" property to determine if we need to write to a csv file
        // either way: use io.socket.emit
        // param "index" corresponds to the correct entry in config.json bc we added the nodeIds (itemToMonitor) to the subscription in the same order as they are in config.json
        if (config.nodeIds[nodeIdName].csv) {
            let entry = "" + value + ";" + Date.parse(timestep) + ";" + new Date(Date.parse(timestep)) + "\n";
            module.exports.appendToCSV(module.exports.getCurrentNodeIdFile(nodeIdName, config), entry);
        }
    },

    appendToCSV: (filepath, content) => {
        console.log("writing to " + filepath);
        let folderRelPath = filepath.slice(0, filepath.lastIndexOf("/"));
        if (!fs.existsSync(folderRelPath)) {
            fs.mkdirSync(folderRelPath);
        }
        let error = false;
        fs.appendFile(filepath, content, (err) => {
            if (err) {
                console.log(err);
                error = true;
            }
        });
        return error;
    },

    readCSV: (filepath) => {
        console.log("reading from " + filepath)
        let data = fs.readFileSync(filepath)
            .toString() // convert Buffer to string
            .split('\n') // split string to lines
            .map(e => e.trim()) // remove white spaces for each line
            .map(e => e.slice(0, e.lastIndexOf(";"))) // remove the readable timestamp column from csv as its not needed here
            .map(e => e.split(';').map(e => e.trim())); // split each line to array
        return data.slice(0, data.length - 1) // - 1 because the last line is an empty line;
    },

    getLatestValues: (filepath, hoursRead) => {
        let csvData = module.exports.readCSV(filepath);
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

    deleteCSV: (filepath) => {
        if (fs.existsSync(filepath)) {
            fs.unlink(filepath, (err) => {
                if (err) {
                    throw err;
                }

                console.log(`Deleted ${filepath} successfully.`);
            });
        }
    },

    createFolderHierarchy: (config) => {
        if (!fs.existsSync(config.logPath)) {
            fs.mkdirSync(config.logPath);
        }
        if (!fs.existsSync(`${config.logPath}/screenshots`)) {
            fs.mkdirSync(`${config.logPath}/screenshots`);
        }
        console.log("Initial Folder Hierarchy created!");
    },

    getCurrentNodeIdFile(nodeIdName, config){
        return `${config.logPath}/${module.exports.getCurrentDateAsFolderName()}/${nodeIdName}.csv`
    },

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