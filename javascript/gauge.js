const ctxGauge = document.getElementById('gauge');

// gaugeNeedle block
const gaugeNeedle = {
    id: 'gaugeNeedle',
    afterDatasetDraw(chart, args, options){
        const { ctx, configGauge, data, chartArea: { top, bottom, left, right, width, height } } = chart;

        ctx.save();
        const needleValue = data.datasets[0].needleValue;
        const dataTotal = data.datasets[0].data.reduce( (a,b) => a + b, 0);
        const angle = Math.PI + ( 1 / dataTotal * needleValue * Math.PI);

        const cx = width/2;
        const cy = chart._metasets[0].data[0].y;

        // needle
        ctx.translate(cx, cy);
        ctx.rotate(angle)
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(chart._metasets[0].data[0].outerRadius, 3)
        ctx.lineTo(0, 3)
        ctx.fillStyle = '#444';
        ctx.fill();
        ctx.restore()

        // needle dot
        ctx.beginPath()
        ctx.arc(cx, cy, 5, 0, 10);
        ctx.fill();
        ctx.restore();

        // value text
        ctx.font = '30px Helvetica';
        ctx.fillStyle = '#444';
        ctx.fillText(needleValue, cx, cy + 30);
        ctx.fillText('m/min', cx, cy + 60);
        ctx.textAlign = 'center';
        ctx.restore();

        // legend text
        ctx.font = '20px Helvetica';
        ctx.fillStyle = '#444';
        var labelText = 10
        chart._metasets[0].data.forEach((element, index) => {
            var lx = element.x - Math.cos(element.endAngle - Math.PI) * (element.innerRadius-20);
            const ly = element.y - Math.sin(element.endAngle - Math.PI) * (element.innerRadius-20);    
            
            if (index == 9) {
                lx -= 5
            }
            ctx.fillText(labelText, lx, ly);
            ctx.textAlign = 'center';
            labelText += data.datasets[0].data[index]
        });
        ctx.fillText('0', chart._metasets[0].data[0].x - chart._metasets[0].data[0].innerRadius + 15, chart._metasets[0].data[0].y);
        
        ctx.restore();
    }
}

const dataGauge = {    
    labels: [],
    datasets: [{
        label: '# of Votes',
        data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        backgroundColor: [
            'rgb(178, 178, 178)',
        ],
        needleValue: 30,
        borderColor: 'white',
        borderWidth: 1,
        cutout: '95%',
        circumference: 180,
        rotation: 270,
        borderRadius: 5,
    }]  
}

const configGauge = {
    type: 'doughnut',
    data: dataGauge,
    options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            tooltip: {
                enabled: false 
            }
        }   
    },
    plugins: [gaugeNeedle]
}

const gauge = new Chart(
    ctxGauge, 
    configGauge
);