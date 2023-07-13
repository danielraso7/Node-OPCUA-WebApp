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
})



function parseLine(elem) {
    return { x: new Date(parseInt(elem[1])), y: parseInt(elem[0]) };
}

function parseLineBooleanValue(elem) {
    return { x: new Date(parseInt(elem[1])), y: elem[0] == 'true' ? 1 : 0 };
}

socket.on("anlageAutomatik", function (data) {
    if (data.value) {
        document.getElementById('auto').className = 'on';
    } else {
        document.getElementById('auto').className = 'off';
    }

});

socket.on("anlageHand", function (data) {
    if (data.value) {
        document.getElementById('hand').className = 'on';
    } else {
        document.getElementById('hand').className = 'off';
    }

});

socket.on("anlageStoerung", function (data) {
    if (data.value) {
        document.getElementById('fault').className = 'fault';
    } else {
        document.getElementById('fault').className = 'off';
    }
});

socket.on("anlageRuesten", function (data) {
    if (data.value) {
        document.getElementById('equip').className = 'equip';
    } else {
        document.getElementById('equip').className = 'off';
    }
});

socket.on("istStückzahl", function (data) {
    document.getElementById('istStueckzahl').textContent = data.value;
});

