$(function() {


'use strict';

var depots;
var positions;
var counter = 0;

var getQuotes = function(symbol, callback) {
  $.getJSON('http://127.0.0.1:3000/quotes?symbol=' + symbol, function (quotes) {
    if (callback) {
      callback(quotes);
    }
  });
};

var getShare = function(symbol, callback) {
  $.getJSON('http://127.0.0.1:3000/share?symbol=' + symbol, function (share) {
    if (callback) {
      callback(share);
    }
  });
};

// get depots
var getDepots = function() {
  $.getJSON('http://127.0.0.1:3000/depots', function (data) {
    depots = data;
    for (var i in depots) {
      $('#depots').append('<option value=' + depots[i].id + '>' + depots[i].name + '</option>');
    }
  });
}();

// get depot positions
var getPositions = function() {
  $.getJSON('http://127.0.0.1:3000/positions?id=1', function (data) {
    positions = data;
    var tr;
    for (var i in positions) {
      tr = $('<tr></tr>');
      tr.append('<td><input type="checkbox" id="c' + positions[i].id + '" value="' + positions[i].symbol + '"/></td>');
      var tooltip = 'Kaufpreis: ' + positions[i].buying_price + '\n' +
                    'Anzahl: '    + positions[i].count        + '\n' +
                    'Daufdatum: ' + positions[i].buying_date  + '\n' +
                    'Symbol: '    + positions[i].symbol       + '\n' +
                    'ISIN: '      + positions[i].isin         + '\n' +
                    'WKN: '       + positions[i].wkn          + '\n';
      tr.append('<td><label for="c' + positions[i].id + '" title="'+ tooltip + '">' + positions[i].name + '</label></td>');
      $('#positions').append(tr);
    }

    $('table#positions input[type="checkbox"]').change(function(e) {
      if ($(e.target).prop('checked') === true) {
        getQuotes($(e.target).prop('value'), function (quotes) {
          getShare($(e.target).prop('value'), function (share) {
            var chart = Highcharts.charts[0];
            chart.addSeries({'name': share[0].name, 'data': quotes});
          });
        });
      }
      else {
        getShare($(e.target).prop('value'), function (share) {
          var chart = Highcharts.charts[0];
          var i;
          for (i = 0; i < chart.series.length; i++) {
            if (chart.series[i].name === share[0].name) {
              chart.series[i].remove();
            }
          }
        });
      }
    });
  });
}();

var createChart = function() {
  // Create the chart
  var chart = $('#container').highcharts();
  if (chart !== undefined) {
    chart.destroy();
  }
  $('#container').highcharts('StockChart', chartOptions);
  Highcharts.setOptions(highchartsOptions);
}();

$('body').keydown(function (e) {
  if (e.keyCode == 27) {
    if ($('#settings').is(':visible')) {
      $('#settings').hide();
    }
    else {
      $('#settings').show();
    }
  }
});

$('#none').click(function (e) {
  var axis = Highcharts.charts[0].yAxis[0];
  axis.setCompare(null);
});

$('#value').click(function (e) {
  var axis = Highcharts.charts[0].yAxis[0];
  axis.setCompare('value');
});

$('#percent').click(function (e) {
  var axis = Highcharts.charts[0].yAxis[0];
  axis.setCompare('percent');
});


});