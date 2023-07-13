const socket = io.connect("http://localhost:3700");

socket.on("geschMitnehmerfoerderer", function (data) {
    gauge.data.datasets[0].needleValue = data.value;
    gauge.update();
});

socket.on("stromBesaeumer1", function (data) {
    if (Array.isArray(data.value)) {
        let stromBesaeumer1Array = data.value;
        for (i = 0; i < stromBesaeumer1Array.length; i++) {
            stromBesaeumer1Array[i] = parseLine(stromBesaeumer1Array[i]);
        }
        lineChartStromBesaeumer1.data.datasets[0].data = stromBesaeumer1Array;
    }
    else {
        lineChartStromBesaeumer1.data.datasets[0].data.push({ x: new Date(data.timestamp), y: parseInt(data.value) });
    }

    configStromBesaeumer1.options.scales.x.max = data.currentTime;
    var coff = 1000 * 60 * 5;
    configStromBesaeumer1.options.scales.x.min = new Date(Math.floor((Date.parse(data.currentTime) - 3600000) / coff) * coff);
    lineChartStromBesaeumer1.update();
})

socket.on("stromBesaeumer2", function (data) {
    if (Array.isArray(data.value)) {
        let stromBesaeumer2Array = data.value;
        for (i = 0; i < stromBesaeumer2Array.length; i++) {
            stromBesaeumer2Array[i] = parseLine(stromBesaeumer2Array[i]);
        }
        lineChartStromBesaeumer2.data.datasets[0].data = stromBesaeumer2Array;
    }
    else {
        lineChartStromBesaeumer2.data.datasets[0].data.push({ x: new Date(data.timestamp), y: parseInt(data.value) });
    }

    configStromBesaeumer2.options.scales.x.max = data.currentTime;
    var coff = 1000 * 60 * 5;
    configStromBesaeumer2.options.scales.x.min = new Date(Math.floor((Date.parse(data.currentTime) - 3600000) / coff) * coff);
    lineChartStromBesaeumer2.update();
})

socket.on("anlageAutomatik", function (data) {
    if (Array.isArray(data.value)) {
        let anlageAutomatikArray = data.value;
        for (i = 0; i < anlageAutomatikArray.length; i++) {
            anlageAutomatikArray[i] = parseLineBooleanValue(anlageAutomatikArray[i]);
        }
        lineChartAnlageAutomatik.data.datasets[0].data = anlageAutomatikArray;
    }
    else {
        lineChartAnlageAutomatik.data.datasets[0].data.push({ x: new Date(data.timestamp), y: data.value == 'true' ? 1 : 0 });
    }

    lineChartAnlageAutomatik.update();

    if (data.value) {
        //document.getElementById('auto').className = 'on';
        document.getElementById('auto').classList.remove("btn-secondary");
        document.getElementById('auto').classList.add("btn-success");
    } else {
        //document.getElementById('auto').className = 'off';
        document.getElementById('auto').classList.remove("btn-success");
        document.getElementById('auto').classList.add("btn-secondary");
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
        document.getElementById('hand').classList.remove("btn-secondary");
        document.getElementById('hand').classList.add("btn-success");
    } else {
        //document.getElementById('hand').className = 'off';
        document.getElementById('hand').classList.remove("btn-success");
        document.getElementById('hand').classList.add("btn-secondary");
    }

});

socket.on("anlageStoerung", function (data) {
    if (data.value) {
        //document.getElementById('fault').className = 'fault';
        document.getElementById('fault').classList.remove("btn-secondary");
        document.getElementById('fault').classList.add("btn-danger");
    } else {
        //document.getElementById('fault').className = 'off';
        document.getElementById('fault').classList.remove("btn-danger");
        document.getElementById('fault').classList.add("btn-secondary");
    }
});

socket.on("anlageRuesten", function (data) {
    if (data.value) {
        //document.getElementById('equip').className = 'equip';
        document.getElementById('equip').classList.remove("btn-secondary");
        document.getElementById('equip').classList.add("btn-info");
    } else {
        //document.getElementById('equip').className = 'off';
        document.getElementById('equip').classList.remove("btn-info");
        document.getElementById('equip').classList.add("btn-secondary");
    }
});

socket.on("istStückzahl", function (data) {
    document.getElementById('istStueckzahl').textContent = "Stück\r\n" + data.value;
});

