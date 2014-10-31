$(function() {
    var seriesOptions = [],
        yAxisOptions = [],
        seriesCounter = 0,
        names = ['CBK.F'],
        colors = Highcharts.getOptions().colors;

    $.each(names, function(i, name) {

        try{
            $.getJSON('http://192.168.169.6:1337/?symbol=' + name,    function(data) {

                seriesOptions[i] = {
                    name: name,
                    data: data
                };

                // As we're loading the data asynchronously, we don't know what order it will arrive. So
                // we keep a counter and create the chart when all the data is loaded.
                seriesCounter++;

                if (seriesCounter == names.length) {
                    createChart();
                }
            });
        }
        catch (err) {
            console.log(error);
        }
    });



    // create the chart when all data is loaded
    function createChart() {

        $('#container').highcharts('StockChart', {
            chart: {
            },

            rangeSelector: {
                selected: 1
            },

            yAxis: {
                labels: {
                    formatter: function() {
                        return (this.value > 0 ? '+' : '') + this.value + '%';
                    }
                },
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            
            plotOptions: {
                series: {
                    compare: 'value'
                }
            },
            
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
                valueDecimals: 2
            },
            
            series: seriesOptions
        });
    }

});