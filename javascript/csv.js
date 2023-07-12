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
            if (err){
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
                    .map(e => e.split(';').map(e => e.trim())); // split each line to array
        return data.slice(1, data.length);
    }
}