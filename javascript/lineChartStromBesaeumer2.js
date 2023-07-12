const ctxStromBesaeumer2 = document.getElementById('stromBesaeumer2');

const dataStromBesaeumer2 = {
    datasets: [{
        label: 'Strom Besäumer 2',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
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
                beginAtZero: true,
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