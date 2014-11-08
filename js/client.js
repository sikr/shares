$(function() {


'use strict';

var hostname = location.hostname;
var depots;
var positions;
var loadingAnimation;
var pendingRequests;

var loading = function(start) {
    if (start) {
    pendingRequests++;
  }
  else {
    pendingRequests--;
  }
  if (pendingRequests === 0) {
    loadingAnimation.hide();
  }
  else {
    loadingAnimation.show();
  }
};

var getQuotes = function(symbol, callback) {
  loading(true);
  $.getJSON('http://' + location.hostname + ':7781/quotes?symbol=' + symbol, function (quotes) {
    if (callback) {
      callback(quotes);
      loading(false);
    }
  });
};

var getShare = function(symbol, callback) {
  loading(true);
  $.getJSON('http://' + location.hostname + ':7781/share?symbol=' + symbol, function (share) {
    if (callback) {
      callback(share);
      loading(false);
    }
  });
};

// get depots
var getDepots = function(callback) {
  loading(true);
  $.getJSON('http://' + location.hostname + ':7781/depots', function (data) {
    depots = data;
    for (var i in depots) {
      $('#depots').append('<option value=' + depots[i].id + '>' + depots[i].name + '</option>');
    }
    callback();
    loading(false);
  });
};

// get depot positions
var getPositions = function(id, callback) {
  loading(true);
  $.getJSON('http://' + location.hostname + ':7781/positions?id=' + id, function (data) {
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
    callback();
    loading(false);

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
};

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

var initUI = function() {
  pendingRequests = 0;
  loadingAnimation = $('<div class="loading"><i class="fa fa fa-refresh fa-spin fa-2x"></i></div>');
  // loadingAnimation.css('height', parseInt($('body').css('height')) + 'px');
  // loadingAnimation.css('width', parseInt($('body').css('width')) + 'px');
  $('body').append(loadingAnimation);
  $('div.loading i').css('margin-top', parseInt($('body').css('height'), 10)/2 - parseInt($('div.loading i').css('height'))/2);

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
}();

var changeDepot = function() {
  var i;
  // $('#positions').off('change');
  $('#positions').empty();

  // clear chart
  var chart = Highcharts.charts[0];
  var count = chart.series.length;
  for (i = 0; i < count; i++) {
    chart.series[0].remove();
  }
  getPositions($('#depots option:selected').attr('value'), function () {
  });
};

var initialize = function() {
  getDepots(function () {
    getPositions(0, function () {
      var i = 0;
      $('#depots option[value="1"]').attr('selected', true);
      $('#depots').change(function () {
        changeDepot();
      });
    });
  });
}();

});