const ctxDoughnut = document.getElementById('doughnut');

const dataDoughnut = {
  labels: [
    'Störung   ',
    'Rüsten    ',
    'Produktiv '
  ],
  datasets: [{
    label: '',
    data: [300, 50, 100],
    backgroundColor: [
      '#dc3545',
      '#0dcaf0',
      'limegreen'
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
          position: 'bottom'
        }
      }   
  },
};

const doughnut = new Chart(
  ctxDoughnut, 
  configDoughnut
);
