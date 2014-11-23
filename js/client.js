$(function() {

'use strict';

var socket = io.connect('http://' + location.hostname + ':7780');
var depots;
var positions;
var colorCounter = 0;
var panel;

var colors = [
  '#c10001', '#edff5b', '#1a9391', '#610c8c',
  '#fc331c', '#c7e000', '#0eacbd', '#980fb7',
  '#ff8f00', '#52e000', '#00c4da', '#d223fe',
  '#ffd221', '#00b22c', '#4643bb', '#b30347'];

var getQuotes = function(symbol, callback) {
  $.getJSON('http://' + location.hostname + ':7781/quotes?symbol=' + symbol, function (quotes) {
    if (callback) {
      callback(quotes);
    }
  });
};

var getShare = function(symbol, callback) {
  $.getJSON('http://' + location.hostname + ':7781/share?symbol=' + symbol, function (share) {
    if (callback) {
      callback(share);
    }
  });
};

// get depots
var getDepots = function(callback) {
  $.getJSON('http://' + location.hostname + ':7781/depots', function (data) {
    depots = data;
    for (var i in depots) {
      $('#depots').append('<option value=' + depots[i].id + '>' + depots[i].name + '</option>');
    }
    callback();
  });
};

// get depot positions
var getPositions = function(id, callback) {
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
  });
};

var initUI = function() {
  var row;
  panel = new UIPanel('panel');
  panel.create('shares').appendTo($('body'));
  panel.addToolbarButton('left', 'options', '', 'fa-bars');
  // panel.addToolbarButton('right', 'settings', '', 'fa-cog');
  // panel.addToolbarButton('right', 'settings', '', 'fa-line-chart');
  panel.addToolbarButton('center', 'overview', 'Übersicht', '');
  panel.addToolbarButton('center', 'chart', 'Chart', '');

  row = $('<div class="row"></div').appendTo(panel.panelLeft);
  $('<label for="depots">Depots:</label>').appendTo(row);
  $('<select id="depots"></select>').appendTo(row);

  row = $('<div class="row"></div').appendTo(panel.panelLeft);
  $('<label>Compare:</label>').appendTo(row);
  $('<button id="none">Ohne</button>').appendTo(row);
  $('<button id="value">Wert</button>').appendTo(row);
  $('<button id="percent">Prozent</button>').appendTo(row);

  $('<div id="positions" class="odd">').appendTo(panel.panelLeft);

  $('#options').click(function (e) {
    panel.toggle('left');
  });

  $('#settings').click(function (e) {
    panel.toggle('right');
  });

  $('body').keydown(function (e) {
    if (e.keyCode == 27) {
      panel.toggle('left');
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
}();

var createChart = function() {
  // Create the chart
  var chart = $('#shares-ui-panel-center').highcharts();
  if (chart !== undefined) {
    chart.destroy();
  }
  $('#shares-ui-panel-center').highcharts('StockChart', chartOptions);
  Highcharts.setOptions(highchartsOptions);
}();

var webSocket = function() {
  socket.on('connect', function(){
    console.log('connected...');
    $('#options i').addClass('ui-color-available');
    $('#options i').removeClass('ui-color-unavailable');
  });
  socket.on('connect_error', function(error) {
    console.log('connect error: ' + JSON.stringify(error));
    $('#options i').addClass('ui-color-unavailable');
    $('#options i').removeClass('ui-color-available');
  });
  socket.on('error', function(error) {
    console.log('error: ' + JSON.stringify(error));
  });
  socket.on('disconnect', function(){
    console.log('disconnected');
    $('#options i').addClass('ui-color-unavailable');
    $('#options i').removeClass('ui-color-available');
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
    getPositions(10, function () {
      var i = 0;
      $('#depots option[value="0"]').attr('selected', true);
      $('#depots').change(function () {
        changeDepot();
      });
    });
  });
}();

});