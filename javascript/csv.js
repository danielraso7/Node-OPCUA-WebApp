const fs = require('fs');

module.exports = {
    appendToCSV: (filepath, content) => {
        console.log("writing to " + filepath)
        let error = false;
        fs.appendFile(filepath, content, (err) => {
            if (err){
                console.log(err);
                error = true;
            }
        });
        return error;
    },

    readCSV: (filepath) => {
        console.log("reading from " + filepath)
        let csvData = '';
        fs.readFile(filepath, (err, data) => {
            if (err){
                console.log(err);
            } else {
                console.log(data);
                csvData = data;
            }
        });
        return csvData;
    }
}