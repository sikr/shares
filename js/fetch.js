var http = require('http');
var fs   = require('fs');

var fetchYahooData = function(symbol, year) {

  var startDate = year + '-01-01';
  var endDate   = year + '-12-31';

  var requestOptions = {
    host: 'query.yahooapis.com',
    path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata' +
      '%20where%20symbol%20in%20(%22' +
      symbol +
      '%22)%20and%20startDate%20=%20%22' +
      startDate +
      '%22%20and%20endDate%20=%20%22' +
      endDate +
      '%22&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json',
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

