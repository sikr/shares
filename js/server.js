/*
 * comment
 */

(function() {

var util    = require('util');
var fs      = require('fs');
var sqlite3 = require("sqlite3").verbose();
var db      = require('./db');
var yql     = require('./yql');
var express = require('express');
var app     = express();
var server  = require('http').Server(app);
var io      = require('socket.io')(server);
var CronJob = require('cron').CronJob;
var winston = require('winston');
var log;

var symbol = "";
var year = "";
var dividendsAndSplits;
var bCreate = false;
var bServer = true;
var bYQL = false;

var databaseDir    = "../db/";
var databaseFile   = "shares.sqlite";

var tableDepots =
  'id            INTEGER,                  ' +
  'name          TEXT,                     ' +
  'description   TEXT,                     ' +
  'PRIMARY KEY   (name)                    ';

var tableDepot =
  'depot_id      INTEGER,                  ' +
  'positions_id,                           ' +
  'PRIMARY KEY   (depot_id, positions_id)  ';

var tableShares =
  'id            INTEGER,                  ' +
  'symbol        TEXT,                     ' +
  'isin          TEXT,                     ' +
  'wkn           TEXT,                     ' +
  'name          TEXT,                     ' +
  'PRIMARY KEY   (symbol, isin, wkn, name) ';

var tablePositions =
  'id            INTEGER,                  ' +
  'share_id      INTEGER,                  ' +
  'symbol        TEXT,                     ' +
  'exchange      TEXT,                     ' +
  'currency      TEXT,                     ' +
  'count         INTEGER,                  ' +
  'buying_price  REAL,                     ' +
  'buying_date   INTEGER,                  ' +
  'selling_price REAL,                     ' +
  'selling_date  INTEGER,                  ' +
  'PRIMARY KEY   (id, share_id, symbol)    ';

var tableQuotes =
  'share_id      INTEGER,                  ' +
  'date          INTEGER,                  ' +
  'open          REAL,                     ' +
  'high          REAL,                     ' +
  'low           REAL,                     ' +
  'close         REAL,                     ' +
  'volume        INTEGER,                  ' +
  'adj_close     REAL,                     ' +
  'PRIMARY KEY   (share_id, date)          ';

var tableHourlyQuotes =
  'share_id              INTEGER,         ' +
  'date                  INTEGER,         ' +
  'ask                   REAL,            ' +
  'bid                   REAL,            ' +
  'change                REAL,            ' +
  'currency              TEXT,            ' +
  'days_low              REAL,            ' +
  'days_high             REAL,            ' +
  'last_trade_date       INTEGER,         ' +
  'last_trade_price_only REAL,            ' +
  'previous_close        REAL,            ' +
  'PRIMARY KEY           (share_id, date) ';

var tableDividends =
  'share_id      INTEGER,                  ' +
  'symbol        TEXT,                     ' +
  'date          INTEGER,                  ' +
  'dividend      REAL,                     ' +
  'PRIMARY KEY   (share_id, symbol, date)  ';

var tableSplits =
  'share_id      INTEGER,                  ' +
  'symbol        TEXT,                     ' +
  'date          INTEGER,                  ' +
  'ratio         TEXT,                     ' +
  'PRIMARY KEY   (share_id, symbol, date)  ';

var dataDepots    = require('../json/depots.json');
var dataDepot     = require('../json/depot.json');
var dataShares    = require('../json/shares.json');
var dataPositions = require('../json/positions.json');
var dataPrivateDepots;
var dataPrivateDepot;
var dataPrivatePositions;

var tmp;

// merge private data (not on github) with public
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
                      {'name': 'dividends', 'sql': tableDividends, 'data': []},
                      {'name': 'splits', 'sql': tableSplits, 'data': []},
                      {'name': 'quotes', 'sql': tableQuotes, 'data': []},
                      {'name': 'adj_quotes', 'sql': tableQuotes, 'data': []},
                      {'name': 'hourly_quotes', 'sql': tableHourlyQuotes, 'data': []}];

//
// set up logging
//
function setUpLog() {
  log = new (winston.Logger)({
    levels: {
      verbose: 1,
      debug:   2,
      info:    3,
      data:    4,
      warn:    5,
      error:   6
    },
    colors: {
      verbose: 'cyan',
      debug:   'blue',
      info:    'green',
      data:    'grey',
      warn:    'yellow',
      error:   'red'
    }
  });
  log.add(winston.transports.Console, {
    level: 'debug',
    prettyPrint: true,
    colorize: true,
    silent: false,
    timestamp: false,
    handleExceptions: true
  });
  log.add(winston.transports.File, {
    filename: '../log/shares.log',
    handleExceptions: true
  });
}

//
// set up cron
//
function setUpCron() {
  var job = new CronJob({
    // cronTime: '0 * * * * *',
    cronTime: '0 0 7-19 * * 1-5',
    onTick:  function () {
      var i;
      var s = [];
      log.info('update quotes');
      db.getSymbols(function(symbols) {
        for (i = 0; i < symbols.length; i++) {
          if (symbols[i].symbol !== '' ) {
            s.push(symbols[i].symbol);
          }
        }
        yql.update(s.join(','), function (data) {
          db.insertUpdate(symbols, data);
        });
      });
    },
    start: true
  });
}

function createDatebase() {
  console.time('Create Datebase');
  if (!fs.existsSync(databaseDir + databaseFile)) {
    if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir);
    }
    db.open(databaseDir + databaseFile);
    db.createTables(databaseDir + databaseFile, databaseTables);
  }
  else {
    db.open(databaseDir + databaseFile);
    db.clear(databaseTables);
    // db.getTables();
  }
  db.fillTables(databaseTables);
  db.dumpFiles();
  console.timeEnd('Create Datebase');
}

function runServer() {
  app.use('/shares', express.static('../'));
  app.use(function (req, res, next) {
    log.info('request:' + req.url);
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
    db.getAdjQuotes(symbol, function (data) {
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

  // xhr server for serving db queries
  var dataServer = app.listen(7781, function () {
    var host = dataServer.address().address;
    var port = dataServer.address().port;
    log.info('Example app listening at http://%s:%s', host, port);
  });

  // http server for serving static content
  var httpServer = server.listen(7780, function () {
    var host = httpServer.address().address;
    var port = httpServer.address().port;
    log.info('Example app listening at http://%s:%s', host, port);
  });

  // websocket server
  io.on('connection', function (socket) {
    log.info('websocket successfully connected');
    socket.on('disconnect', function () {
      log.info('websocket disconnected');
    });
  });
}

function parseArgs() {

  for (var i = 0; i < process.argv.length; i++) {
    if (process.argv[i] == '-c' || process.argv[2] == '--create') {
      bCreate = true;
      bServer = false;
    }
    else if (process.argv[i] == '-ds' || process.argv[i] == '--dividendsandsplits') {
      dividendsAndSplits = true;
      bYQL = true;
      bServer = false;
    }
    else if (process.argv[i] == '-s' || process.argv[i] == '--symbol') {
      symbol = process.argv[++i];
      bYQL = true;
      bServer = false;
    }
    if (process.argv[i] == '-y' || process.argv[i] == '--year') {
      year = process.argv[++i];
      bYQL = true;
      bServer = false;
    }
  }
}

setUpLog();
db.setLog(log);
parseArgs();

if (bCreate) {
  createDatebase();
}
else if (bYQL) {
  if (symbol.length && year.length) {
    if (symbol.toUpperCase() === 'ALL') {
      db.open(databaseDir + databaseFile);
      if (dividendsAndSplits) {
        db.getSymbols(function(symbols) {
          yql.fetchAllDividendsAndSplits(symbols, year);
        });
      }
      else {
        db.getSymbols(function(symbols) {
          yql.fetchAllQuotes(symbols, year);
        });
      }
    }
    else {
      if (dividendsAndSplits) {
        yql.fetchDividendsAndSplits(symbol, year);
      }
      else {
        yql.fetchQuotes(symbol, year);
      }
    }
  }
}
else if (bServer) {
  setUpCron();
  db.open(databaseDir + databaseFile);
  runServer();
}


})();
