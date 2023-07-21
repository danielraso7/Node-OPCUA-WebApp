const fs = require('fs');

module.exports = {
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

    deleteCSV: (filepath) => {
        if(fs.existsSync(filepath)) {
            fs.unlink(filepath, (err) => {
                if (err) {
                    throw err;
                }
            
                console.log(`Deleted ${filepath} successfully.`);
            });
        }
    }
}