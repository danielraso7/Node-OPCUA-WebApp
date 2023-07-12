const socket = io.connect("http://localhost:3700");

socket.on("geschMitnehmerfoerderer", function (data) {
    gauge.data.datasets[0].needleValue = data.value;
    gauge.update();
});

socket.on("anlageAutomatik", function (data) {
    console.log("anlageAutomatik");
    if (data.value){
        document.getElementById('auto').className = 'on';
    } else {
        document.getElementById('auto').className = 'off';
    }
    
});

socket.on("anlageHand", function (data) {
    console.log("anlageHand");
    if (data.value){
        document.getElementById('hand').className = 'on';
    } else {
        document.getElementById('hand').className = 'off';
    }
    
});

socket.on("anlageStoerung", function (data) {
    console.log("anlageStoerung");
    if (data.value){
        document.getElementById('fault').className = 'fault';
    } else {
        document.getElementById('fault').className = 'off';
    }
});

socket.on("anlageRuesten", function (data) {
    console.log("anlageRuesten");
    if (data.value){
        document.getElementById('equip').className = 'equip';
    } else {
        document.getElementById('equip').className = 'off';
    }
});

socket.on("istStückzahl", function (data) {
    console.log("istStückzahl");
    document.getElementById('istStueckzahl').textContent = data.value;   
});

