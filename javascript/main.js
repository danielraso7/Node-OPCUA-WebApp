const socket = io.connect("http://localhost:3700");

socket.on("geschMitnehmerfoerderer", function (data) {
    gauge.data.datasets[0].needleValue = data.value;
    gauge.update();
});

socket.on("stromBesaeumer1", function (data) {
    if (Array.isArray(data.value)) {
        let stromBesaeumer1Array = data.value;
        for (let i = 0; i < stromBesaeumer1Array.length; i++) {
            stromBesaeumer1Array[i] = parseLine(stromBesaeumer1Array[i]);
        }
        lineChartStromBesaeumer1.data.datasets[0].data = stromBesaeumer1Array;
    }
    else {
        lineChartStromBesaeumer1.data.datasets[0].data.push({ x: new Date(data.timestamp), y: parseInt(data.value) });
    }

    configStromBesaeumer1.options.scales.x.max = data.currentTime;
    let coff = 1000 * 60 * 5;
    configStromBesaeumer1.options.scales.x.min = new Date(Math.floor((Date.parse(data.currentTime) - 3600000) / coff) * coff);
    lineChartStromBesaeumer1.update();
})

socket.on("stromBesaeumer2", function (data) {
    if (Array.isArray(data.value)) {
        let stromBesaeumer2Array = data.value;
        for (let i = 0; i < stromBesaeumer2Array.length; i++) {
            stromBesaeumer2Array[i] = parseLine(stromBesaeumer2Array[i]);
        }
        lineChartStromBesaeumer2.data.datasets[0].data = stromBesaeumer2Array;
    }
    else {
        lineChartStromBesaeumer2.data.datasets[0].data.push({ x: new Date(data.timestamp), y: parseInt(data.value) });
    }

    configStromBesaeumer2.options.scales.x.max = data.currentTime;
    let coff = 1000 * 60 * 5;
    configStromBesaeumer2.options.scales.x.min = new Date(Math.floor((Date.parse(data.currentTime) - 3600000) / coff) * coff);
    lineChartStromBesaeumer2.update();
})

socket.on("anlageAutomatik", function (data) {
    let setButtonToSuccessOrLight;

    if (Array.isArray(data.value)) {
        let anlageAutomatikArray = data.value;
        for (let i = 0; i < anlageAutomatikArray.length; i++) {
            anlageAutomatikArray[i] = parseLineBooleanValue(anlageAutomatikArray[i]);
        }
        lineChartAnlageAutomatik.data.datasets[0].data = anlageAutomatikArray;

        setButtonToSuccessOrLight = anlageAutomatikArray[anlageAutomatikArray.length - 1].y; // .y because of object, see parseLineBooleanValue
    } else {
        let convertedValue;
        if (typeof data.value == 'string'){
            convertedValue = data.value == 'true' ? 1 : 0;
        } else {
            convertedValue = data.value ? 1 : 0;
        }
        lineChartAnlageAutomatik.data.datasets[0].data.push({ x: new Date(data.timestamp), y: convertedValue });

        setButtonToSuccessOrLight = data.value;
    }

    lineChartAnlageAutomatik.update();

    if (setButtonToSuccessOrLight) {
        //document.getElementById('auto').className = 'on';
        document.getElementById("auto").classList.remove("btn-light");
        document.getElementById("auto").classList.add("btn-success");
    } else {
        //document.getElementById('auto').className = 'off';
        document.getElementById("auto").classList.remove("btn-success");
        document.getElementById("auto").classList.add("btn-light");
    }
})



function parseLine(elem) {
    return { x: new Date(parseInt(elem[1])), y: parseInt(elem[0]) };
}

function parseLineBooleanValue(elem) {
    return { x: new Date(parseInt(elem[1])), y: elem[0] == 'true' ? 1 : 0 };
}

socket.on("anlageHand", function (data) {
    if (data.value) {
        //document.getElementById('hand').className = 'on';
        document.getElementById('hand').classList.remove("btn-light");
        document.getElementById('hand').classList.add("btn-success");
    } else {
        //document.getElementById('hand').className = 'off';
        document.getElementById('hand').classList.remove("btn-success");
        document.getElementById('hand').classList.add("btn-light");
    }

});

socket.on("anlageStoerung", function (data) {
    if (data.value) {
        //document.getElementById('fault').className = 'fault';
        document.getElementById('fault').classList.remove("btn-light");
        document.getElementById('fault').classList.add("btn-danger");
    } else {
        //document.getElementById('fault').className = 'off';
        document.getElementById('fault').classList.remove("btn-danger");
        document.getElementById('fault').classList.add("btn-light");
    }
});

socket.on("anlageRuesten", function (data) {
    if (data.value) {
        //document.getElementById('equip').className = 'equip';
        document.getElementById('equip').classList.remove("btn-light");
        document.getElementById('equip').classList.add("btn-info");
    } else {
        //document.getElementById('equip').className = 'off';
        document.getElementById('equip').classList.remove("btn-info");
        document.getElementById('equip').classList.add("btn-light");
    }
});

socket.on("istStückzahl", function (data) {
    document.getElementById('istStueckzahl').textContent = "Stück\r\n" + data.value;
});

socket.on("pause", function (data) {
    doughnut.data.datasets[0].data[0] = parseInt(data.value);
    doughnut.update();
});

socket.on("ruesten", function (data) {
    doughnut.data.datasets[0].data[1] = parseInt(data.value);
    doughnut.update();
});

socket.on("produktiv", function (data) {
    doughnut.data.datasets[0].data[2] = parseInt(data.value);
    doughnut.update();
});

// socket.on("stoerung", function (date) {
//     doughnut.data.datasets[0].data[3] = parseInt(date.value);
//     doughnut.update();
// });

