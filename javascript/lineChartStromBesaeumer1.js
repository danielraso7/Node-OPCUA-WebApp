const ctxStromBesaeumer1 = document.getElementById('stromBesaeumer1');

const dataStromBesaeumer1 = {
    datasets: [{
        label: 'Strom Besäumer 1',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [
        ],
    }]
};

const configStromBesaeumer1 = {
    type: 'line',
    data: dataStromBesaeumer1,
    plugins: {
        title: {
            text: 'Chart.js Time Scale',
            display: true
        }
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
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


const lineChartStromBesaeumer1 = new Chart(
    ctxStromBesaeumer1,
    configStromBesaeumer1
);