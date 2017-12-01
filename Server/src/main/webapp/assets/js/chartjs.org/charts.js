var indexChart = {
    popLabels: function (data) {
        let arr = [], str = "";
        for (let i = 0; i < data.length; i++) {
            str = (new Date((data[i].point) * 1000)).toString();
            str = str.substr(0, (str.indexOf("GMT") - 1));
            arr.push(str);
        }
        return arr;
    },

    popVar: function (data) {
        console.log(data);
        /*let arr = [];
        for (let i = 0; i < data.length; i++) {
            console.log(data[i].value);
            arr.push(data[i].value);
        }*/
        return data.map(function(point) { return point.value; });
    },

    makeConfig: function (JSON, yName) {
        return {
            type: 'line',
            data: {
                labels: this.popLabels(JSON.data),
                datasets: [{
                    label: "",
                    backgroundColor: window.chartColors.purple,
                    borderColor: window.chartColors.purple,
                    data: this.popVar(JSON.data),
                    fill: false
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: ''
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: ''
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: yName
                        }
                    }]
                }
            }
        };
    },

    drawChart: function (type, data) {
        let ctx;
        if (type === "money") {
            ctx = document.getElementById("time-money-canvas").getContext("2d");
            window.myLine = new Chart(ctx, this.makeConfig(data, 'Денежные поступления (сум)'));
        } else {
            ctx = document.getElementById("time-passengers-canvas").getContext("2d");
            window.myLine = new Chart(ctx, this.makeConfig(data, 'Количество произведенных оплат'));
        }
    }
};

var months = ['January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'];

function compare(a, b) {
    return months.indexOf(a.month)
        - months.indexOf(b.month);
}

var stat_routesChart = {
    drawStatRoutes: function (JSON) {
        var colorNames = Object.keys(window.chartColors);
        var colorName = colorNames[3];
        var dsColor = window.chartColors[colorName];
        var datasets = [];

        var years = this.popYears(JSON.data);

        for (let j = 0; j < years.length; j++) {
            var array = this.popVar(JSON.data, years[j]);
            colorName = colorNames[j];
            dsColor = window.chartColors[colorName];

            datasets.push({
                label: years[j],
                backgroundColor: Color(dsColor).alpha(0.5).rgbString(),
                borderColor: dsColor,
                borderWidth: 1,
                data: array
            });
        }

        var barChartData = {
            labels: months,
            datasets: datasets
        };

        var ctx = document.getElementById("canvasStatroutes").getContext("2d");
        window.myBar = new Chart(ctx, {
            type: 'bar',
            data: barChartData,
            options: {
                responsive: true,
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: ''
                }
            }
        });
    },
    popYears: function (data) {
        let arr = [];
        console.log(data);
        for (let i = 0; i < Object.keys(data).length; i++) {
            if (arr.indexOf(data[i].year) < 0) {
                arr.push(data[i].year);
            }
        }
        return arr;
    },
    popVar: function (data, year) {
        let arr = [];
        for (let i = 0; i < Object.keys(data).length; i++) {
            if (data[i].year === year) {
                arr.push({month: data[i].month, value: data[i].value});
            }
        }
        if (arr.length !== 12) {
            this.fillEmptyMonth(arr);
        }

        var new_array = [];
        for(let j = 0; j < arr.length; j++){
            new_array.push(arr[j].value);
        }

        return new_array; //должно быть 12, потому что 12 месяцев
    },
    fillEmptyMonth: function (arr) {
        var f;
        for (let i = 0; i < 12; i++) {
            f = false;
            for (let j = 0; j < arr.length; j++) {
                if (arr[j].month === months[i]) {
                    f = true;
                    break;
                }
            }

            if (!f) {
                arr.push({month: months[i], value: 0});
            }
        }

        arr.sort(compare);

        return arr;
    }
};

// var colorNames = Object.keys(window.chartColors);
// document.getElementById('addDataset').addEventListener('click', function () {
//     var colorName = colorNames[barChartData.datasets.length % colorNames.length];
//
//     var dsColor = window.chartColors[colorName];
//     var newDataset = {
//         label: 'Dataset ' + barChartData.datasets.length,
//         backgroundColor: color(dsColor).alpha(0.5).rgbString(),
//         borderColor: dsColor,
//         borderWidth: 1,
//         data: []
//     };
//
//     for (var index = 0; index < barChartData.labels.length; ++index) {
//         newDataset.data.push(randomScalingFactor());
//     }
//
//     barChartData.datasets.push(newDataset);
//     window.myBar.update();
// });
//
// document.getElementById('removeDataset').addEventListener('click', function () {
//     barChartData.datasets.splice(0, 1);
//     window.myBar.update();
// });
//
// document.getElementById('removeData').addEventListener('click', function () {
//     barChartData.labels.splice(-1, 1); // remove the label first
//
//     barChartData.datasets.forEach(function (dataset, datasetIndex) {
//         dataset.data.pop();
//     });
//
//     window.myBar.update();
// });