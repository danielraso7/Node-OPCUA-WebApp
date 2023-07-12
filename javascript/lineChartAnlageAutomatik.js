const ctxAnlageAutomatik = document.getElementById('anlageAutomatik');

const dataAnlageAutomatik = {
    datasets: [{
        label: 'Automatik Betrieb',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [
        ],
    }]
};

const configAnlageAutomatik = {
    type: 'line',
    data: dataAnlageAutomatik,
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
                min: '00:00',
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
                max: 1,
                ticks: {
                    stepSize: 1,
                },
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Value'
                }
            }
        },
    }
};

const lineChartAnlageAutomatik = new Chart(
    ctxAnlageAutomatik,
    configAnlageAutomatik
);