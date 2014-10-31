/*
 * comment
 */

var util = require('util');
var fs = require('fs');
var http = require('http');
var sqlite3 = require("../../../nodejs/node_modules/sqlite3").verbose();
var http = require('http');

var databaseFile = "../db/shares.sqlite";
var db;

var tableDepots    = 'id            INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                     'name          TEXT,                              ' +
                     'description   TEXT                               ';

var tableDepot     = 'depot_id      INTEGER,                            ' +
                     'positions_id                                      ';

var tableShares    = 'id            INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                     'symbol        TEXT,                              ' +
                     'isin          TEXT,                              ' +
                     'wkn           TEXT,                              ' +
                     'name          TEXT                               ';
                     // 'exchange      TEXT,                              ' +
                     // 'currency      TEXT                               ' +

var tablePositions = 'id            INTEGER PRIMARY KEY AUTOINCREMENT, ' +
                     'share_id      INTEGER,                           ' +
                     'count         INTEGER,                           ' +
                     'buying_price  REAL,                              ' +
                     'buying_date   INTEGER,                           ' +
                     'selling_price REAL,                              ' +
                     'selling_date  INTEGER                            ';

var tableQuotes    = 'share_id      INTEGER,                           ' +
                     'date          INTEGER,                           ' +
                     'open          REAL,                              ' +
                     'high          REAL,                              ' +
                     'low           REAL,                              ' +
                     'close         REAL,                              ' +
                     'volume        INTEGER,                           ' +
                     'adj_close     REAL                               ';

var valuesDepots = require('../json/depots.json');
var valuesDepot =  require('../json/depot.json');
var valuesShares  = require('../json/shares.json');
var valuesPositions = require('../json/positions.json');

/******************************************************************************
 *
 *
 *
 *
 */
function openDatabase() {
  db = new sqlite3.Database(databaseFile);
}
/******************************************************************************
 *
 *
 *
 *
 */
clearDatabase = function()
{
  var stmt;
  stmt = db.prepare('DELETE FROM depots');
  console.log(stmt.sql);
  stmt.run();
  stmt.finalize();
  stmt = db.prepare('DELETE FROM depot');
  console.log(stmt.sql);
  stmt.run();
  stmt.finalize();
  stmt = db.prepare('DELETE FROM shares');
  console.log(stmt.sql);
  stmt.run();
  stmt.finalize();
  stmt = db.prepare('DELETE FROM positions');
  console.log(stmt.sql);
  stmt.run();
  stmt.finalize();
  stmt = db.prepare('DELETE FROM quotes');
  console.log(stmt.sql);
  stmt.run();
  stmt.finalize();
}
/******************************************************************************
 *
 *
 *
 *
 */
createDatabase = function()
{
  var exists = fs.existsSync(databaseFile);
  if (exists)
  {
    fs.unlinkSync(databaseFile);
  }
  openDatabase();
  // db.serialize(function() {
  //   db.run('CREATE TABLE currency (' + tableCurrency + ')');
  // });
  // db.serialize(function() {
  //   db.run('CREATE TABLE prices (' + tablePrices + ')');
  // });
  db.serialize(function() {
    db.run('CREATE TABLE depots (' + tableDepots + ')');
  });
  db.serialize(function() {
    db.run('CREATE TABLE depot (' + tableDepot + ')');
  });
  db.serialize(function() {
    db.run('CREATE TABLE shares (' + tableShares + ')');
  });
  db.serialize(function() {
    db.run('CREATE TABLE positions (' + tablePositions + ')');
  });
  db.serialize(function() {
    db.run('CREATE TABLE quotes (' + tableQuotes + ')');
  });
}
/******************************************************************************
 *
 *
 *
 *
 */
function fillDatebase() {
  try {
    for (var i in valuesDepots) {
      var stmt = db.prepare(
        'INSERT INTO depots VALUES ("' +
        valuesDepots[i].id             + '", "' +
        valuesDepots[i].name           + '", "' +
        valuesDepots[i].description    + '")'
      );
      console.log(stmt.sql);
      stmt.run();
      stmt.finalize();
    }
  }
  catch (err) {
    console.log(err);
  }

  try {
    for (var i in valuesDepot) {
      var stmt = db.prepare(
        'INSERT INTO depot VALUES ("' +
        valuesDepot[i].depot_id       + '", "' +
        valuesDepot[i].positions_id   + '")'
      );
      console.log(stmt.sql);
      stmt.run();
      stmt.finalize();
    }
  }
  catch (err) {
    console.log(err);
  }

  try {
    for (var i in valuesShares) {
      var stmt = db.prepare(
        'INSERT INTO shares VALUES ("' +
        valuesShares[i].id             + '", "' +
        valuesShares[i].symbol         + '", "' +
        valuesShares[i].isin           + '", "' +
        valuesShares[i].wkn            + '", "' +
        valuesShares[i].name           + '")'
      );
      console.log(stmt.sql);
      stmt.run();
      stmt.finalize();
    }
  }
  catch (err) {
    console.log(err);
  }

  try {
    for (var i in valuesPositions) {
      var stmt = db.prepare(
        'INSERT INTO positions VALUES ("' +
        valuesPositions[i].id             + '", "' +
        valuesPositions[i].share_id       + '", "' +
        // valuesPositions[i].symbol         + '", "' +
        // valuesPositions[i].exchange       + '", "' +
        // valuesPositions[i].currency       + '", "' +
        valuesPositions[i].count          + '", "' +
        valuesPositions[i].buying_price   + '", "' +
        valuesPositions[i].buying_date    + '", "' +
        valuesPositions[i].selling_price  + '", "' +
        valuesPositions[i].selling_date   + '")'
      );
      console.log(stmt.sql);
      stmt.run();
      stmt.finalize();
    }
  }
  catch (err) {
    console.log(err);
  }
}
/******************************************************************************
 *
 *
 *
 *
 */
closeDatabase = function()
{
  db.close();
}

function fetchYahooData() {

  var symbols = ['RYS1.F'];

  var startDate = new Array();
  var endDate = new Array();
  startDate[0] = '2014-01-01';
  endDate[0] = '2014-12-31';

  var s = 0;
  var y = 0;

  var requestOptions = {
    host: 'query.yahooapis.com',
    path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata' +
      '%20where%20symbol%20in%20(%22' +
      symbols[s] +
      '%22)%20and%20startDate%20=%20%22' +
      startDate[y] +
      '%22%20and%20endDate%20=%20%22' +
      endDate[y] +
      '%22&env=http%3A%2F%2Fdatatables.org%2Falltables.env&format=json',
    method: 'GET'
  };

  callback = function(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      var json = JSON.parse(str);
      fs.writeFile('../data/' + symbols[s] + '_' + startDate[y].substr(0,4) + '.json', JSON.stringify(json, null, '  '));
    });
  }
  console.log('http://' + requestOptions.host + requestOptions.path);
  http.request(requestOptions, callback).end();
}
function getFiles() {

  var files = fs.readdirSync('../data/');
  var symbol;
  var symbols = [];
  var i;
  var f;
  var id;
  var res;
  var stmt;
  var count = 0;
  var totalCount = 0;
  var sum;

  db.all('SELECT shares.id AS id, shares.name AS name, shares.symbol AS symbol FROM shares', function(err, rows) {
    for (i in rows) {
      symbols[rows[i].id] = rows[i].symbol;
    }
    for (f in files) {
      symbol = files[f].split('_')[0];
      id = -1;
      // find the appropriate id for this symbol
      for (i in symbols) {
        if (symbols[i] == symbol) {
          id = i;
        }
      }
      if (id > -1) {
        console.log('Processing file ' + files[f] + ', Symbol ' + symbol + ', Id ' + id);
        res = require('../data/' + files[f]).query.results.quote;
        count = 0;
        sum = 0;
        for (i in res) {
          try {
            stmt = db.prepare(
              'INSERT INTO quotes VALUES ("' +
              id                     + '", ' +
              'date("' + res[i].Date + '"), "' +
              res[i].Open            + '", "' +
              res[i].High            + '", "' +
              res[i].Low             + '", "' +
              res[i].Close           + '", "' +
              res[i].Volume          + '", "' +
              res[i].Adj_Close       + '")'
            );
            // console.log(stmt.sql);
            stmt.run();
            stmt.finalize();
          }
          catch (err) {
            console.log(err);
          }
          sum += parseFloat(res[i].Close);
          count++;
          totalCount++;
        }
        console.log('  -> ' + count + ' entries inserted, sum=' + sum);
      }
    }
    console.log('total count: ' + totalCount);
  });
}
function testDatabase() {
  db.all('SELECT shares.id AS id, ' +
                'shares.name AS name, ' +
                'positions.count AS count, ' +
                'quotes.close AS close, ' +
                'quotes.date AS date ' +
                'FROM shares, positions, quotes ' +
                'WHERE shares.id=quotes.share_id ' +
                'AND quotes.date=date("2014-01-06")' +
                'AND positions.share_id=shares.id ' +
                'ORDER BY id',
                function(err, rows) {
    if (err) {
      console.log(err);
    }
    else{
      sum = 0;
      for (i in rows) {
        console.log(rows[i].id + ', ' + rows[i].name + ', ' + rows[i].date + ', ' + rows[i].close + ', ' + rows[i].count);
        sum += (rows[i].close * rows[i].count);
      }
      console.log(sum)
    }
  });
}
function getData(symbol, callback, response) {
  var count = 0;
  var stmt = 'SELECT strftime("%s", quotes.date) as date, ' +
  // var stmt = 'SELECT date(quotes.date) as date, ' +
             'quotes.close as close ' +
             'FROM quotes, shares ' +
             'WHERE shares.symbol="' + symbol + '" AND ' +
             'shares.id=quotes.share_id ' +
             'ORDER BY date';
  console.log(stmt);
  db.all(stmt, function(err, rows) {
    if (err) {
      console.log(err);
    }
    else {
      var all = [];
      for (var i in rows) {
        var set = [];
        var value = parseFloat(rows[i].close, 10);
        // if (parseInt(rows[i].date + '000', 10) < 1372032000000) {
        //   value /= 2;
        // }
        set.push(parseInt(rows[i].date + '000', 10));
        set.push(value);
        all.push(set);
        count++;
      }
      callback(all, response);
      console.log('Retrieved ' + count + ' entries.');
    }
  });
}
function sendResponse(data, response) {
    response.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
    response.write(JSON.stringify(data, null, '  '));
    response.end('\n');
}
function startServer() {
  http.createServer(function (req, res) {
    if (req.url == "/favicon.ico") {
      res.writeHead(404, {'Content-Type': 'application/json'});
      res.end('\n');
    }
    else {
      var symbol = decodeURIComponent(req.url).split("=")[1].split(';')[0];
      getData(symbol, sendResponse, res);
    }
  }).listen(1337, '192.168.169.6');
  console.log('Server running at http://192.168.169.6:1337/');
}
// fetchYahooData();
// createDatabase();
// openDatabase();
// clearDatabase();
// fillDatebase();
// getFiles();
// testDatabase();
// prettyFiles();
// closeDatabase();
openDatabase();
startServer();
