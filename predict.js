var invest_input = document.getElementById('invest');
var rate_input = document.getElementById('rate');
var years_input = document.getElementById('years');

const optimized_length = 1000;

var prediction_line = document.querySelector(".prediction-line");
prediction_line_data = {
                        labels : [new Date()],
                        datasets: [
                            {
                                data: [invest_input],
                                borderColor: '#8142ff',
                            },
                        ],
                    };

prediction_line_plot = new Chart(prediction_line, {
    type : 'line',
    data : prediction_line_data,
    options: {
        spanGaps: true,
        cubicInterpolationMode: 'linear',
        datasets: {
            line: {
                pointRadius: 0  
            }
        },
        elements: {
            point: {
                radius: 0
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: {
                    autoSkip: false
                }
            }
        },
    },
});

predict([parseFloat(invest_input.value), parseFloat(rate_input.value), parseFloat(years.value)]);

function predict(...inputs) {
    const daily_rate = inputs[0][1]/36000;

    var start_date = new Date();
    var end_date = new Date(start_date.getFullYear() + inputs[0][2], start_date.getMonth(), start_date.getDate() + 1);
    var current_date = new Date(start_date);

    var dates_array = [];
    var total_array = [];
    var total = inputs[0][0];

    dates_array.push(new Date(current_date).toISOString().split('T')[0].replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1'));
    while (current_date.getTime() <= end_date.getTime()) {
        dates_array.push('');
        total_array.push(total.toFixed(2));
        current_date.setDate(current_date.getDate() + 1);
        total+=total*daily_rate;
    }
    dates_array.pop()
    dates_array[dates_array.length-1] = new Date(current_date);
    dates_array[dates_array.length-1].setDate(dates_array[dates_array.length-1].getDate()-1);
    dates_array[dates_array.length-1] = dates_array[dates_array.length-1].toISOString().split('T')[0].replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$3/$2/$1');
    
    var prediction_total = document.getElementById('prediction_total');
    prediction_total.innerHTML = "$"+total_array[total_array.length-1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    
    total_array = optimize_dataset(total_array, total_array.length, optimized_length)
    dates_array = optimize_dataset(dates_array, dates_array.length, optimized_length)

    prediction_line_data.datasets[0].data = total_array;
    prediction_line_data.labels = dates_array;

    prediction_line_plot.update();
}

function update(field) {
    var alert_element = document.createElement('div');
    alert_element.className = 'success';

    const success_messages = {'rate': 'La Tasa se ha actualizado correctamente',
                'years': 'Los Años se han actualizado correctamente',
                'invest': 'La Inversión se ha actualizado correctamente'
                };

    const error_messages = {'rate': 'Error: La Tasa no puede ser mayor a 100%',
                            'years': 'Error: Los Años no pueden ser mayores a 100',
                            'invest': 'A quien engañas ¡Nadie tiene más de 1,000,000,000! 😂😂😂'
                            }

    alert_element.textContent = success_messages[field];
    var inputs = [invest_input, rate_input, years_input];
    var maxs = [999999999, 100, 100];

    var timeout = 1000;

    for (var i = 0; i < inputs.length; i++) {
        if (isNaN(parseFloat(inputs[i].value))) {
            inputs[i].value = 0;
        } else if (parseFloat(inputs[i].value) < 0) {
            inputs[i].value = 0;
        } else {
            inputs[i].value = parseFloat(inputs[i].value);
        }

        if (parseFloat(inputs[i].value) > maxs[i]) {
            inputs[i].value = maxs[i];
            alert_element.className = 'error';
            alert_element.textContent = error_messages[field];
            if (field == 'invest') {
                timeout = 3000;
            }
        }
    }

    document.body.appendChild(alert_element);
    setTimeout(() => {
        alert_element.style.opacity = '0';
        alert_element.style.pointerEvents = 'none';
    }, timeout);

    predict(inputs.map(input => parseFloat(input.value)));   
}

function optimize_dataset(dataset, length, desired_length) {
    if (desired_length >= length) {
        return dataset;
    }

    var new_data_set = new Array(desired_length);
    new_data_set[0] = dataset[0];
    var j = 1;

    for (var i = 1; i < length - 1; i++) {
        if (i % Math.floor(length/(desired_length - 1)) === 0) {
            new_data_set[j] = dataset[i];
            j++;
        }
    }

    new_data_set[new_data_set.length-1] = dataset[length - 1];
    return new_data_set;
}