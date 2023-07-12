const ctxLineChart1 = document.getElementById('stromBesaeumer1');

const data1 = {
    datasets: [{
        label: 'Strom Besäumer 1',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [
        ],
    }]
};

const configLineChart1 = {
    type: 'line',
    data: data1,
    plugins: {
        title: {
            text: 'Chart.js Time Scale',
            display: true
        }
    },
    options: {
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

const lineChart1 = new Chart(
    ctxLineChart1,
    configLineChart1
);