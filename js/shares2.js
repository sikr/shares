$(function() {

    name = 'CBK.F';

    $.getJSON('http://192.168.169.6:1337/?symbol=' + name, function(data) {
        // Create the chart
        $('#container').highcharts('StockChart', {
            

            rangeSelector : {
                selected : 1
            },

            title : {
                text : 'Commerzbank'
            },
            
            series : [{
                name : 'Commerzbank',
                data : data,
                tooltip: {
                    valueDecimals: 2
                }
            }]
        });
    });

});