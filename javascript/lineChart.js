const ctxLineChart1 = document.getElementById('stromBesaeumer1');

dataSet = [
    {x: '15:35', y: 10},
    {x: '15:39', y: 40},
    {x: '15:40', y: 10},
    {x: '15:41', y: 30},
    {x: '15:43', y: 70},
    {x: '15:45', y: 30},
    {x: '15:49', y: 10}
]

const labels1 = ['16:00', '16:05', '16:10', '16:15', '16:20', '16:25', '16:30', '16:35', '16:40', '16:45', '16:50', '16:55']


const data1 = {
    labels: labels1,
    datasets: [{
      label: 'Strom Besäumer 1',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: [
        {x: '16:05', y: 10},
        {x: '16:09', y: 40},
        {x: '16:10', y: 10},
        {x: '16:11', y: 30},
        {x: '16:13', y: 70},
        {x: '16:15', y: 30},
        {x: '16:19', y: 10}
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
    options:{
        scales: {
            x: {
                ticks: {
                    source: 'labels'
                },
                type: 'time',
                displayFormats: {
                    quarter: 'HH:mm'
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