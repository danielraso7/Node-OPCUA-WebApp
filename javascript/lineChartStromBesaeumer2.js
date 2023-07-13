const ctxStromBesaeumer2 = document.getElementById('stromBesaeumer2');

const dataStromBesaeumer2 = {
    datasets: [{
        label: 'Strom Besäumer 2',
        backgroundColor: 'rgb(135, 206, 250)',
        borderColor: 'rgb(135, 206, 250)',
        data: [
        ],
    }]
};

const configStromBesaeumer2 = {
    type: 'line',
    data: dataStromBesaeumer2,
    plugins: {
        title: {
            text: 'Chart.js Time Scale',
            display: true
        }
    },
    options: {
        responsive: true,
        animation: {     
            y: {
            duration: 1 
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute'
                },
                displayFormats: {
                    quarter: 'HH:mm'
                },
                ticks: {
                    stepSize: 5,
                },
                distribution: 'linear',
                title: {
                    display: true,
                    text: 'Zeit'
                }
            },
            y: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: 'Value'
                }
            }
        },
    }
};

const lineChartStromBesaeumer2 = new Chart(
    ctxStromBesaeumer2,
    configStromBesaeumer2
);