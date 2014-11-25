(function() {


'use strict';

var http = require('http');
var fs   = require('fs');
var util = require('util');

exports.fetchQuotes = function(symbol, year) {

  var startDate = year + '-01-01';
  var endDate   = year + '-12-31';

  // concat select statement
  var select = util.format(
    'select * from yahoo.finance.historicaldata ' +
    'where symbol in ("%s") and ' +
    'startDate = "%s" and ' +
    'endDate = "%s"',
    symbol, startDate, endDate);

  // put URL together with encoded select statement
  var encoededURL = '/v1/public/yql?q=' +
    encodeURIComponent(select) +
    '&env=http://datatables.org/alltables.env&format=json';

  var requestOptions = {
    host: 'query.yahooapis.com',
    path: encoededURL,
    method: 'GET'
  };
  console.log('http://' + requestOptions.host + requestOptions.path);

  http.request(requestOptions, function(response) {
    var str = '';

    // another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    // write to disk if complete
    response.on('end', function () {
      var json = JSON.parse(str);
      fs.writeFile('../data/' + symbol + '_' + startDate.substr(0,4) + '.json', JSON.stringify(json, null, '  '));
    });
  }).end();
};

exports.fetchDividendsAndSplits = function(symbol, year) {

  var startDay = 0;
  var startMonth = 0;
  var startYear = year;
  var endDay = 31;
  var endMonth = 12;
  var endYear = new Date().getFullYear();

  // concat select statement
  var params = util.format(
    's=%s&a=%s&b=%s&c=%s&d=%s&e=%s&f=%s&g=v&y=0&z=30000',
    symbol, startDay, startMonth, startYear, endDay, endMonth, endYear);

  // put URL together with encoded select statement
  var url = '/x?' + params;

  var requestOptions = {
    host: 'ichart.finance.yahoo.com',
    path: url,
    method: 'GET'
  };
  // console.log('http://' + requestOptions.host + requestOptions.path);

  http.request(requestOptions, function(response) {
    var str = '';

    // another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    // write to disk if complete
    response.on('end', function () {
      var json = [];
      var lines = str.split('\n');
      var content;
      var date;
      var i;
      var type; //dividend or split
      for (i = 0; i < lines.length; i++) {
        content = lines[i].split(',');
        if (lines[i].indexOf('DIVIDEND') === 0) {
          date = content[1].substr(1); // remove trailing space
          json.push({
            "Symbol" : symbol,
            "Date": date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2),
            "Dividend": content[2]
          });
        }
        else if (lines[i].indexOf('SPLIT') === 0) {
          date = content[1].substr(1); // remove trailing space
          json.push({
            "Symbol" : symbol,
            "Date": date.substr(0, 4) + '-' + date.substr(4, 2) + '-' + date.substr(6, 2),
            "Split": content[2]
          });
        }
      }
      fs.writeFile('../data/' + symbol + '_dividends_and_splits.json', JSON.stringify(json, null, '  '));
      console.log(JSON.stringify(json));
    });
  }).end();
};

exports.update = function(symbols, callback) {

  // concat select statement
  var select = util.format(
    'select symbol, Ask, Bid, Change, Currency, DaysLow, DaysHigh, LastTradeDate, LastTradePriceOnly, PreviousClose from yahoo.finance.quotes ' +
    'where symbol in ("%s")',
    symbols);

  // put URL together with encoded select statement
  var encoededURL = '/v1/public/yql?q=' +
    encodeURIComponent(select) +
    '&env=http://datatables.org/alltables.env&format=json';

  var requestOptions = {
    host: 'query.yahooapis.com',
    path: encoededURL,
    method: 'GET'
  };
  console.log('http://' + requestOptions.host + requestOptions.path);

  http.request(requestOptions, function(response) {
    var str = '';

    //another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      if (undefined !== callback) {
        callback(JSON.parse(str));
      }
    });
  }).end();
};

exports.fetchAllQuotes = function(symbols, year) {
  var intervalId;
  var callFetch = function() {
    if (symbols.length > 0) {
      var row = symbols.pop();
      if (row && row.symbol) {
        fetchQuotes(row.symbol, year);
      }
    }
    else {
      clearInterval(intervalId);
    }
  };
  intervalId = setInterval(callFetch, 5000);
};

exports.fetchAllDividendsAndSplits = function(symbols, year) {
  var intervalId;
  var callFetch = function() {
    if (symbols.length > 0) {
      var row = symbols.pop();
      if (row && row.symbol) {
        fetchDividendsAndSplits(row.symbol, year);
      }
    }
    else {
      clearInterval(intervalId);
    }
  };
  intervalId = setInterval(callFetch, 5000);
};


// var symbol = "";
// var year = "";
// var symbols = "";
// var dividendsAndSplits;

// for (var i = 0; i < process.argv.length; i++) {
//   if (process.argv[i] == '-y') {
//     year = process.argv[++i];
//   }
//   else if (process.argv[i] == '-s') {
//     symbol = process.argv[++i];
//   }
//   else if (process.argv[i] == '-u') {
//     symbols = process.argv[++i];
//   }
//   else if (process.argv[i] == '-ds') {
//     dividendsAndSplits = true;
//   }
// }
// if (symbol.length && year.length) {
//   if (symbol.toUpperCase() === 'ALL') {
//     db.open(databaseDir + databaseFile);
//     if (dividendsAndSplits) {
//       db.getSymbols(function(symbols) {
//         fetchAllDividendsAndSplits(symbols, year);
//       });
//     }
//     else {
//       db.getSymbols(function(symbols) {
//         fetchAllQuotes(symbols, year);
//       });
//     }
//   }
//   else {
//     if (dividendsAndSplits) {
//       fetchDividendsAndSplits(symbol, year);
//     }
//     else {
//       fetchQuotes(symbol, year);
//     }
//   }
// }
// else if (symbols.length) {
//   update(symbols);
// }


})();
