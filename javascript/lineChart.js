const ctxLineChart1 = document.getElementById('stromBesaeumer1');

dataSet = [
    { x: '15:35', y: 10 },
    { x: '15:39', y: 40 },
    { x: '15:40', y: 10 },
    { x: '15:41', y: 30 },
    { x: '15:43', y: 70 },
    { x: '15:45', y: 30 },
    { x: '15:49', y: 10 }
]

const labels1 = ['13:00', '13:05', '13:10', '13:15', '13:20', '13:25', '13:30', '13:35', '13:40']


const data1 = {
    datasets: [{
        label: 'Strom Besäumer 1',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: [
            { x: '16:05:59', y: 10 },
            { x: '16:09', y: 40 },
            { x: '16:10', y: 10 },
            { x: '16:11', y: 30 },
            { x: '16:13', y: 70 },
            { x: '16:15', y: 30 },
            { x: '16:19', y: 10 }
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
                    //maxTicksLimit: 12
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

function msToHMS(ms) {
    // 1- Convert to seconds:
    var seconds = ms / 1000;
    // 2- Extract hours:
    var hours = parseInt(seconds / 3600) % 24; // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    var minutes = parseInt(seconds / 60); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    seconds = seconds % 60;
    return padTo2Digits(hours) + ":" + padTo2Digits(minutes) + ":" + padTo2Digits(parseInt(seconds));
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }