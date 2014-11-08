/*
 * comment
 */

(function() {

var util    = require('util');
var fs      = require('fs');
var sqlite3 = require("sqlite3").verbose();
var db      = require('./db');
var http    = require('http');
var express = require('express');
var app     = express();


var databaseDir    = "../db/";
var databaseFile   = "shares.sqlite";

var tableDepots    = 'id            INTEGER PRIMARY KEY,              ' +
                     'name          TEXT,                             ' +
                     'description   TEXT                              ';

var tableDepot     = 'depot_id      INTEGER,                          ' +
                     'positions_id                                    ';

var tableShares    = 'id            INTEGER PRIMARY KEY,              ' +
                     'symbol        TEXT,                             ' +
                     'isin          TEXT,                             ' +
                     'wkn           TEXT,                             ' +
                     'name          TEXT                              ';

var tablePositions = 'id            INTEGER PRIMARY KEY,              ' +
                     'share_id      INTEGER,                          ' +
                     'symbol        TEXT,                             ' +
                     'exchange      TEXT,                             ' +
                     'currency      TEXT,                             ' +
                     'count         INTEGER,                          ' +
                     'buying_price  REAL,                             ' +
                     'buying_date   INTEGER,                          ' +
                     'selling_price REAL,                             ' +
                     'selling_date  INTEGER                           ';

var tableQuotes    = 'id            INTEGER PRIMARY KEY AUTOINCREMENT,' +
                     'share_id      INTEGER,                          ' +
                     'date          INTEGER,                          ' +
                     'open          REAL,                             ' +
                     'high          REAL,                             ' +
                     'low           REAL,                             ' +
                     'close         REAL,                             ' +
                     'volume        INTEGER,                          ' +
                     'adj_close     REAL                              ';

var dataDepots    = require('../json/depots.json');
var dataDepot     = require('../json/depot.json');
var dataShares    = require('../json/shares.json');
var dataPositions = require('../json/positions.json');
var dataPrivateDepots;
var dataPrivateDepot;
var dataPrivatePositions;

var tmp;

// merge private date (not on github) with public
if (fs.existsSync('../json/private_depots.json')) {
  dataPrivateDepots  = require('../json/private_depots.json');
  tmp = dataDepots.concat(dataPrivateDepots);
  dataDepots = tmp;
}

if (fs.existsSync('../json/private_depot.json')) {
  dataPrivateDepot  = require('../json/private_depot.json');
  tmp = dataDepot.concat(dataPrivateDepot);
  dataDepot = tmp;
}

if (fs.existsSync('../json/private_positions.json')) {
  dataPrivatePositions  = require('../json/private_positions.json');
  tmp = dataPositions.concat(dataPrivatePositions);
  dataPositions = tmp;
}

var databaseTables = [{'name': 'depots', 'sql': tableDepots, 'data': dataDepots},
                      {'name': 'depot', 'sql': tableDepot, 'data': dataDepot},
                      {'name': 'shares', 'sql': tableShares, 'data': dataShares},
                      {'name': 'positions', 'sql': tablePositions, 'data': dataPositions},
                      {'name': 'quotes', 'sql': tableQuotes, 'data': []}];

db.open(databaseFile);

function createDatebase() {
  if (!fs.existsSync(databaseDir + databaseFile)) {
    if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir);
      db.open(databaseDir + databaseFile);
      db.createTables(databaseDir + databaseFile, databaseTables);
    }
  }
  else {
    db.clear(databaseTables);
  }
  // db.createTables(databaseFile, databaseTables);
  db.fillTables(databaseTables);
  db.dumpFiles();
  // db.test();
  // db.close();
}

function runServer() {
  app.use('/shares', express.static('../'));
  app.use(function (req, res, next) {
    console.log('request:' + req.url);
    next();
  });
  app.get('/depots', function (req, res) {
    // http://host:port/depots
    res.header("Access-Control-Allow-Origin", "*");
    res.header('foo', 'bar');
    db.getDepots(function (data) {
      res.send(JSON.stringify(data));
    });
  });

  app.get('/depot', function (req, res) {
    // http://host:port/depot?id=1
    var depot = req.url.substr(10);
    res.header("Access-Control-Allow-Origin", "*");
    res.header('foo', 'bar');
    db.getDepot(depot, function (data) {
      res.send(JSON.stringify(data));
    });
  });

  app.get('/positions', function (req, res) {
    // http://host:port/positions?id=1
    var depot = req.url.substr(14);
    res.header("Access-Control-Allow-Origin", "*");
    res.header('foo', 'bar');
    db.getPositions(depot, function (data) {
      res.send(JSON.stringify(data));
    });
  });

  app.get('/quotes', function (req, res) {
    // http://host:port/quotes?symbol=1
    var symbol = req.url.substr(15);
    res.header("Access-Control-Allow-Origin", "*");
    res.header('foo', 'bar');
    db.getQuotes(symbol, function (data) {
      res.send(JSON.stringify(data));
    });
  });

  app.get('/share', function (req, res) {
    // http://host:port/share?symbol=1
    var symbol = req.url.substr(14);
    res.header("Access-Control-Allow-Origin", "*");
    res.header('foo', 'bar');
    db.getShare(symbol, function (data) {
      res.send(JSON.stringify(data));
    });
  });

  var dataServer = app.listen(3000, function () {
    var host = dataServer.address().address;
    var port = dataServer.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
  var httpServer = app.listen(8080, function () {
    var host = httpServer.address().address;
    var port = httpServer.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
}

if (process.argv[2] == '-c' || process.argv[2] == '--create') {
  console.time('Create Datebase');
  createDatebase();
  console.timeEnd('Create Datebase');
}
else {
  runServer();
}

})();