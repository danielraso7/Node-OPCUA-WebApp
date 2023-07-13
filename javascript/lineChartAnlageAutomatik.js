const ctxAnlageAutomatik = document.getElementById('anlageAutomatik');

const dataAnlageAutomatik = {
    datasets: [{
        label: 'Automatik Betrieb',
        backgroundColor: 'rgb(102, 205, 0)',
        borderColor: 'rgb(102, 205, 0)',
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
        maintainAspectRatio: false,
        responsive: true,
        animation: {     
            y: {
            duration: 1 
            }
        },
        scales: {
            x: {
                min: '08:00',
                type: 'time',
                time: {
                    unit: 'minute'
                },
                displayFormats: {
                    quarter: 'HH:mm'
                },
                ticks: {
                    stepSize: 60,
                },
                distribution: 'linear',
                title: {
                    display: true,
                    text: 'Zeit'
                }
            },
            y: {
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