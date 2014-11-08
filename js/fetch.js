var http = require('http');
var fs   = require('fs');
var util = require('util');

var fetchYahooData = function(symbol, year) {

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

    //another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      var json = JSON.parse(str);
      fs.writeFile('../data/' + symbol + '_' + startDate.substr(0,4) + '.json', JSON.stringify(json, null, '  '));
    });
  }).end();
};

var symbol = "";
var year = "";

for (var i = 0; i < process.argv.length; i++) {
  if (process.argv[i] == '-y') {
    year = process.argv[++i];
  }
  else if (process.argv[i] == '-s') {
    symbol = process.argv[++i];
  }
}
if (symbol.length && year.length) {
  fetchYahooData(symbol, year);
}

