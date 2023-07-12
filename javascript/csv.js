var fs = require('fs');

function appendToCSV(filepath, content){
    console.log("writing to " + filepath)
    let error = false;
    fs.appendFile(filepath, content, (err) => {
        if (err){
            console.log(err);
            error = true;
        }
    });
    return error
}

function readCSV(filepath, content){
    console.log("reading from " + filepath)
    let csvData = '';
    fs.readFile(filepath, (err, data) => {
        if (err){
            console.log(err);
        } else {
            csvData = data;
        }
    });
    return csvData;
}
