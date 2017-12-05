function changeToUTC(str) {
    // console.log("str = " + str);
    // str = new Date(str).toISOString();

    // let isoDate = new Date(str).toISOString();
    // console.log("isoDate = " + isoDate);

    let dateString = str,
        dateTimeParts = dateString.split('T'),
        timeParts = dateTimeParts[1].split(':'),
        dateParts = dateTimeParts[0].split('-'),
        date;

    date = Date.UTC(dateParts[0], dateParts[1], dateParts[2], timeParts[0], timeParts[1]);

    // console.log("date.getTime()/1000 = " + date.getTime() / 1000);
    // console.log("date = " + (date / 1000));

    return (date / 1000);
};

const indexHtml = {
    links: {
        getCommon: "/ITS/statictics/data",
        getRoutes: "/ITS/entety/route",
        getField: "/ITS/statictics/data",
        getChart1: "/ITS/statictics/fugure",
        getChart2: "/ITS/statictics/fugure"
    },

    getCommonData: function () {
        $.ajax({
            type: 'GET',
            url: this.links.getCommon,
            dataType: "json",
            success: function (data) {
                if (data.error !== "") {
                    alert(data.error);
                }
                if (data.status === "ok") {
                    indexHtml.fillCommonInfo(data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    },

    getRoutesID: function () {
        $.ajax({
            type: 'GET',
            url: this.links.getRoutes,
            dataType: "json",
            success: function (data) {
                if (data.error !== "") {
                    alert(data.error);
                }
                if (data.status === "ok") {
                    indexHtml.fillRoutes(data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    },


    fillCommonInfo: function (data) {
        console.log(data);
        let percent, str;

        $(".makeVisible").css("display", "none");
        $(".divPersentage").css("display", "none");

        $("#permanent_passengers").html(data.data.totalPassengers + " человек");
        $("#transactions").html(data.data.totalTravels + " поездок");
        $("#earned_money").html(data.data.totalMoney + " сум");
    },

    fillRoutes: function (data) {
        let str = "";
        for (let i in data.data) {
            str += "<option value=\"" + data.data[i].id + "\">" + data.data[i].name + "</option>";
        }
        $("#route_id").html(str);
    },

    getData: function () {
        $.ajax({
            type: 'GET',
            url: this.links.getField,
            dataType: "json",
            data: [
                "id=" + $("#route_id option:selected").val(),
                "object=" + "route",
                "start=" + changeToUTC($("#period-begin").val()),
                "end=" + changeToUTC($("#period-end").val())
            ].join('&'),
            success: function (data) {
                if (data.error !== "") {
                    alert("Error != ''");
                }
                if (data.status === "ok") {
                    indexHtml.fillField(data.data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });

        //filling chart with money
        $.ajax({
            type: 'GET',
            url: this.links.getChart1,
            dataType: "json",
            data: [
                "id=" + $("#route_id option:selected").val(),
                "start=" + changeToUTC($("#period-begin").val()),
                "end=" + changeToUTC($("#period-end").val()),
                "type=" + "money",
                "object=" + "route"
            ].join('&'),
            success: function (data) {
                // drawCharts();
                indexChart.drawChart("money", data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });

        //filling chart with transactions
        $.ajax({
            type: 'GET',
            url: this.links.getChart2,
            dataType: "json",
            data: [
                "id=" + $("#route_id option:selected").val(),
                "start=" + changeToUTC($("#period-begin").val()),
                "end=" + changeToUTC($("#period-end").val()),
                "type=" + "travels",
                "object=" + "route"
            ].join('&'),
            success: function (data) {
                indexChart.drawChart("travels", data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    },

    fillField: function (data) {
        let percent, str;

        $(".makeVisible").css("display", "");
        $(".divPersentage").css("display", "");

        // console.log(data.passengers);
        $("#permanent_passengers").html(data.passangers + " человек");
        $("#transactions").html(data.travels + " поездок");
        $("#earned_money").html(data.money + " сум");

        percent = Math.round((data.passangers * 100) / data.totalPassengers);
        // console.log(percent, data.totalPassengers);
        str = '<div class="easypiechart" id="easypiechart-red" data-percent="' + percent + '"><span class="percent">' + percent + '%</span></div><div class="card-image red"><h4 >Всего: ' + data.totalPassengers + ' человек</h4></div>';
        $("#pie-passengers").html(str);

        percent = Math.round((data.travels * 100) / data.totalTravels);
        str = '<div class="easypiechart" id="easypiechart-orange" data-percent="' + percent + '"><span class="percent">' + percent + '%</span></div><div class="card-image orange"><h4>Всего: ' + data.totalTravels + ' поездок</h4></div>';
        $("#pie-transactions").html(str);

        percent = Math.round((data.money * 100) / data.totalMoney);
        str = '<div class="easypiechart" id="easypiechart-blue" data-percent="' + percent + '"><span class="percent">' + percent + '%</span></div><div class="card-image blue"><h4>Всего: ' + data.totalMoney + ' сум</h4></div>';
        $("#pie-earned_money").html(str);


        $('#easypiechart-red').easyPieChart({
            scaleColor: false,
            barColor: '#f9243f'
        });

        $('#easypiechart-orange').easyPieChart({
            scaleColor: false,
            barColor: '#ffb53e'
        });

        $('#easypiechart-blue').easyPieChart({
            scaleColor: false,
            barColor: '#30a5ff'
        });
    }
};

const statRoutesHtml = {
    getYears_: "/ITS/statictics/years",
    yearPass: "/ITS/statictics/month",

    showYears: function (data) {
        var str = "";
        var col = Math.floor(12 / data.length);
        for (let i = 0; i < data.length; i++) {
            str +=
                "<div class=\"col-lg-" + col + " col-md-" + col + " col-sm-" + col + "\">\n" +
                "<input type=\"checkbox\" id=\"" + data[i] + "\" name=\"check_list[]\" value=\"" + data[i] + "\" class=\"form-control\">\n" +
                "<label for=\"" + data[i] + "\">" + data[i] + "</label>\n" +
                "</div>";
        }
        $("#years").html(str);
    },

    getYears: function () {
        $.ajax({
            type: 'GET',
            url: this.getYears_,
            dataType: "json",
            success: function (data) {
                console.log(data);
                statRoutesHtml.showYears(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    },

    getInfo: function () {
        console.log(this.changeYear());
        // $("#statCanvas").html("");
        $("#statCanvas").html("<canvas id=\"canvasStatroutes\" width=\"588\" height=\"294\" class=\"chartjs-render-monitor\"\n" +
            "style=\"display: block; width: 588px; height: 294px;\"></canvas>");
        $.ajax({
            type: 'GET',
            url: this.yearPass,
            dataType: "json",
            data: {
                "data": this.changeYear(),
            },
            success: function (data) {
                console.log(data);
                stat_routesChart.drawStatRoutes(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    },

    changeYear: function () {
        return $("input[name='check_list[]']:checked")
            .map(function () {
                return $(this).val();
            }).get();
    }
};

const dataVehiclesHtml = {
    getAll: "src/php/databaseVehicles.php",
    _deleteRow: "src/php/databaseVehiclesDelete.php",

    getAllVehicles: function () {
        $.ajax({
            type: 'POST',
            url: dataVehiclesHtml.getAll,
            dataType: "json",
            // data: {
            //     "data": this.changeYear(),
            // },
            success: function (data) {
                console.log(data);
                dataVehiclesHtml.insertValues(data.data[0]);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    },

    insertValues: function (data) {
        var str;

        for (let i = 0; i < data.length; i++) {
            str += '<tr class="gradeA odd" id="'+i+'">\n' +
                '<td class="sorting_1">' + data[i].licensePlate + '</td>\n' +
                '<td class=" ">' + data[i].type + '</td>\n' +
                '<td class=" ">' + data[i].driver + '</td>\n' +
                '<td class="center ">' + data[i].routeName + '</td>\n' +
                '<td><a class="waves-effect waves-light btn" onclick="dataVehiclesHtml.deleteRow('+i+')">Удалить</a></td>' +
                '</tr>';
        }

        $("#vehiclesTable").html(str);
    },

    deleteRow: function (rowId) {
        $.ajax({
            type: 'POST',
            url: dataVehiclesHtml._deleteRow,
            dataType: "html",
            data: [
                "id=" + rowId
            ].join('&'),
            success: function (data) {
                console.log("Удалилось");
                console.log(data);
                dataVehiclesHtml.insertValues(data.data[0]);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert(errorThrown);
            }
        });
    }
};
