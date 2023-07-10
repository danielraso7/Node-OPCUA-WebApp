const socket = io.connect("http://localhost:3700");

socket.on("geschMitnehmerfoerderer", function (data) {
    console.log("HIIIIII");
    gauge.data.datasets[0].needleValue = data.value;
    gauge.update();
});
