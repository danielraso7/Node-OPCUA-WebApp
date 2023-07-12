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
        lineChart1.data.datasets[0].data = stromBesaeumer1Array;
    }
    else {
        lineChart1.data.datasets[0].data.push({ x: new Date(data.timestamp), y: parseInt(data.value) });
    }
    lineChart1.update();
})

function parseLine(elem) {
    return { x: new Date(parseInt(elem[1])), y: parseInt(elem[0]) };
}

socket.on("anlageAutomatik", function (data) {
    console.log("anlageAutomatik");
    if (data.value) {
        document.getElementById('auto').className = 'on';
    } else {
        document.getElementById('auto').className = 'off';
    }

});

socket.on("anlageHand", function (data) {
    console.log("anlageHand");
    if (data.value) {
        document.getElementById('hand').className = 'on';
    } else {
        document.getElementById('hand').className = 'off';
    }

});

socket.on("anlageStoerung", function (data) {
    console.log("anlageStoerung");
    if (data.value) {
        document.getElementById('fault').className = 'fault';
    } else {
        document.getElementById('fault').className = 'off';
    }
});

socket.on("anlageRuesten", function (data) {
    console.log("anlageRuesten");
    if (data.value) {
        document.getElementById('equip').className = 'equip';
    } else {
        document.getElementById('equip').className = 'off';
    }
});

socket.on("istStückzahl", function (data) {
    console.log("istStückzahl");
    document.getElementById('istStueckzahl').textContent = data.value;
});

