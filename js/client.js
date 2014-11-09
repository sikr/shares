$(function() {

'use strict';

var socket = io.connect('http://' + location.hostname + ':7780');
var depots;
var positions;
var loadingAnimation;
var pendingRequests;
var serverUnavailable;
var colorCounter = 0;

var colors = [
  '#c10001', '#edff5b', '#1a9391', '#610c8c',
  '#fc331c', '#c7e000', '#0eacbd', '#980fb7',
  '#ff8f00', '#52e000', '#00c4da', '#d223fe',
  '#ffd221', '#00b22c', '#4643bb', '#b30347'];

var loading = function(start) {
    if (true === start) {
    pendingRequests++;
  }
  else if (false === start) {
    pendingRequests--;
  }
  if (pendingRequests === 0) {
    loadingAnimation.hide();
  }
  else {
    loadingAnimation.show();
  }
};

var unavailable = function(state) {
  if (true === state) {
    serverUnavailable.show();
  }
  else {
    serverUnavailable.hide();
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
    var list = $('<ul class="positions-list"></ul');
    $('#positions').append(list);
    for (var i in positions) {
      list.append($('<li data-symbol="' + positions[i].symbol + '">' + positions[i].name + '</li>'));
    }
    $('ul.positions-list li').click(function (e) {
      $(e.target).toggleClass('selected');

      if ($(e.target).hasClass('selected')) {
        var color = colorCounter++ % 16 + 1;
        $(e.target).addClass('selected-color-' + color);
        $(e.target).data('selected-color', color);
        getQuotes($(e.target).data('symbol'), function (quotes) {
          getShare($(e.target).data('symbol'), function (share) {
            var chart = Highcharts.charts[0];
            console.log('color: ' + color);
            chart.addSeries({'name': share[0].name, 'data': quotes, color: colors[color-1]});
          });
        });
      }
      else {
        $(e.target).removeClass('selected-color-' + $(e.target).data('selected-color'));
        getShare($(e.target).data('symbol'), function (share) {
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
    callback();
    loading(false);
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
  $('body').append(loadingAnimation);

  serverUnavailable = $('<div class="loading"><i class="fa fa fa-refresh fa-spin fa-2x"></i><br>Server unavailable</div>');
  $('body').append(serverUnavailable);

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

var webSocket = function() {
  socket.on('connect', function(){
    unavailable(false);
    console.log('connected...');
  });
  socket.on('connect_error', function(error) {
    unavailable(true);
    console.log('connect error: ' + JSON.stringify(error));
  });
  socket.on('error', function(error) {
    console.log('error: ' + JSON.stringify(error));
  });
  socket.on('disconnect', function(){
    unavailable(true);
    console.log('disconnected');
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