const ctxDoughnut = document.getElementById('doughnut');

const dataDoughnut = {
  labels: [
    'Störung',
    'Rüsten',
    'Produktiv'
  ],
  datasets: [{
    label: '',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(102, 205, 0)'
    ],
    hoverOffset: 4
  }]
};

const configDoughnut = {
    type: 'doughnut',
    data: dataDoughnut,
    options: {
      responsive: true,
      plugins: {
        tooltip: {
            enabled: true 
        },
        legend: {
          position: 'right'
        }
      }   
  },
};

const doughnut = new Chart(
  ctxDoughnut, 
  configDoughnut
);
