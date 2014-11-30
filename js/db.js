(function() {

'use strict';

var db;
var fs                  = require('fs');
var sqlite3             = require("sqlite3").verbose();
var TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;
var log;


exports.setLog = function(logger) {
  log = logger;
};

exports.open = function(file) {
  db = new TransactionDatabase(
    new sqlite3.Database(file, function (err) {
      if (null !== err) {
        log.error('error opening database file: %s', JSON.stringiy(err));
      }
    })
  );
};

exports.clear = function(tables) {
  db.serialize(function () {
    var table;
    var stmt;
    for (table in tables) {
      stmt = db.prepare('DELETE FROM ' + tables[table].name);
      stmt.run();
    }
    stmt.finalize();
  });
};

exports.deleteFromDisk = function(file, tables){
  var exists = fs.existsSync(file);
  if (exists) {
    fs.unlinkSync(file);
  }
};

exports.createTables = function(file, tables){
  var stmt;
  db.serialize(function () {
    var table;
    for (table in tables) {
      stmt = db.prepare('CREATE TABLE ' + tables[table].name + ' (' + tables[table].sql + ')');
      stmt.run();
    }
    stmt.finalize();
  });
};

exports.fillTables = function(tables){
  var i;
  db.serialize(function (){
    var stmt;
    var table;
    var sql;
    var i;
    var j;
    var v; // array of values inserted
    var q; // array of questions marks added to the INSERT statement

    var callback = function () {
      log.verbose(this.sql);
    };

    // creates SQL statements like
    //   INSERT INTO tablename VALUES (?,?,?,?)
    for (table in tables) {
      if (tables[table].data.length > 0) {
        q = [];
        sql = 'INSERT INTO ' + tables[table].name + ' VALUES (';
        for (i in tables[table].data[0]) {
          q.push('?');
        }
        sql += q.join(',') + ')';
        stmt = db.prepare(sql);
        for (i = 0; i < tables[table].data.length; i++){
          v = [];
          for (j in tables[table].data[i]) {
            v.push(tables[table].data[i][j]);
          }
          log.verbose(sql + ' ' + JSON.stringify(v) + '(' + v.length + ')');
          stmt.simon = JSON.stringify(v);
          stmt.run(v, callback);
        }
        stmt.finalize();
      }
    }
    // create depot with all shares
    
  });
};

exports.getTables = function () {
  var stmt = db.prepare('SELECT * FROM sqlite_master');
  stmt.all(function (err, rows) {
    if (err) {
      log.error(err);
    }
    else {
      var r = rows;
    }
  });
};

exports.close = function()
{
  db.serialize(function () {
    db.close();
  });
};

exports.test = function() {
  var stmt; 
  stmt = db.prepare(
    'SELECT   shares.id AS id,               ' +
    '         shares.name AS name,           ' +
    '         positions.count AS count,      ' +
    '         quotes.close AS close,         ' +
    '         quotes.date AS date            ' +
    'FROM     shares, positions, quotes      ' +
    'WHERE    shares.id=quotes.share_id      ' +
    'AND      quotes.date=date("2014-10-30") ' +
    'AND      positions.share_id=shares.id   ' +
    'ORDER BY shares.name                    ');

  stmt.all(function (err, rows) {
    if (err) {
      log.error(err);
    }
    else {
      sum = 0;
      for (var i in rows) {
        rows[i].sum = (rows[i].close * rows[i].count).toFixed(2);
        log.info(JSON.stringify(rows[i]));
        sum += (rows[i].close * rows[i].count);
      }
      log.info(sum);
    }
  });
};

exports.getDepots = function(callback) {
  var stmt;
  stmt = db.prepare(
    'SELECT   id,         ' +
    '         name,       ' +
    '         description ' +
    'FROM     depots      ' +
    'ORDER BY id          ');
  stmt.all(function (err, rows) {
    if (err) {
      log.error(err);
    }
    else {
      callback(rows);
    }
  });
};

exports.getDepot = function(depot, callback) {
  var stmt;
  stmt  = db.prepare(
    'SELECT   positions_id  ' +
    'FROM     depot         ' +
    'WHERE    depot_id=?    ' +
    'ORDER BY positions_id  ');
  stmt.all(depot, function (err, rows) {
    if (err) {
      log.error(err);
    }
    else{
      callback(rows);
    }
  });
};

exports.getPositions = function(depot, callback) {
  var stmt = db.prepare(
    'SELECT                                       ' +
    // '         depot.depot_id,                     ' +
    // '         depot.positions_id,                 ' +
    // '         positions.id,                       ' +
    // '         positions.share_id,                 ' +
    '         positions.symbol,                   ' +
    '         positions.count,                    ' +
    '         positions.buying_price,             ' +
    '         positions.buying_date,              ' +
    '         positions.selling_price,            ' +
    '         positions.selling_date,             ' +
    '         shares.id,                          ' +
    '         shares.symbol,                      ' +
    '         shares.name,                        ' +
    '         shares.isin,                        ' +
    '         shares.wkn                          ' +
    'FROM     depots, depot, positions, shares    ' +
    'WHERE    depot.depot_id=?                    ' +
    'AND      depots.id=depot.depot_id            ' +
    'AND      depot.positions_id=positions.id     ' +
    'AND      positions.share_id=shares.id        ' +
    'AND      positions.selling_date=""           ' +
    'GROUP BY shares.id                           ' +
    'ORDER BY shares.name                         ');
  stmt.all(depot, function (err, rows) {
    if (err) {
      log.error(err);
    }
    else{
      callback(rows);
    }
  });
};

exports.getQuotes = function(symbol, callback) {
  var stmt = db.prepare(
    'SELECT   strftime("%s", quotes.date) * 1000 AS date,                           ' +
    '         quotes.close AS close                                                 ' +
    'FROM     shares, quotes                                                        ' +
    'WHERE    shares.symbol=?                                                       ' +
    // 'AND      strftime("%s", quotes.date) > strftime("%s", date("now", "-3 years")) ' +
    'AND      quotes.share_id=shares.id                                             ' +
    'ORDER BY quotes.date                                                           ');
  stmt.all(symbol, function (err, rows) {
    var a = [];
    var i;
    if (err) {
      log.error(err);
    }
    else {
      for (i in rows) {
        a.push([rows[i].date, rows[i].close]);
      }
      callback(a);
    }
  });
};

exports.getAdjQuotes = function(symbol, callback){
  var stmt = db.prepare(
    'SELECT   strftime("%s", adj_quotes.date) * 1000 AS date,                           ' +
    '         adj_quotes.close AS close                                                 ' +
    'FROM     shares, adj_quotes                                                        ' +
    'WHERE    shares.symbol=?                                                           ' +
    // 'AND      strftime("%s", adj_quotes.date) > strftime("%s", date("now", "-3 years")) ' +
    'AND      adj_quotes.share_id=shares.id                                             ' +
    'ORDER BY adj_quotes.date                                                           ');
  stmt.all(symbol, function (err, rows) {
    var a = [];
    var i;
    if (err) {
      log.error(err);
    }
    else {
      for (i in rows) {
        a.push([rows[i].date, rows[i].close]);
      }
      callback(a);
    }
  });
};

exports.getShare = function(symbol, callback) {
  var stmt = db.prepare(
    'SELECT *       ' +
    'FROM   shares  ' +
    'WHERE  symbol=?');
  stmt.all(symbol, function (err, rows) {
    if (err) {
      log.error(err);
    }
    else {
      callback(rows);
    }
  });
};

exports.getSymbols = function(callback) {
  var stmt = db.prepare(
    'SELECT   id,          ' +
    '         symbol       ' +
    'FROM     shares       ' +
    'WHERE    symbol != "" ' *
    'GROUP BY id, symbol   ');
  stmt.all(function (err, rows) {
    if (err) {
      log.error(err);
    }
    else {
      callback(rows);
    }
  });
};

exports.dumpFiles = function(callback) {
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
  var close;

  stmt = db.prepare(
    'SELECT shares.id AS id,        ' +
    '       shares.name AS name,    ' +
    '       shares.symbol AS symbol ' +
    'FROM   shares                  ');
  stmt.all(function (err, rows) {
    db.beginTransaction(function (err, transaction) {
      var i;
      var f;
      var content;

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
          log.info('Processing file ' + files[f] + ', Symbol ' + symbol + ', Id ' + id);
          content = require('../data/' + files[f]);
          if (files[f].indexOf('_dividends_and_splits') > -1) {
            //
            // process dividends and splits
            //
            res = content;
            for (i in res) {
              if (undefined !== res[i].Dividend) {
                stmt = transaction.prepare('INSERT INTO dividends VALUES (?, ?, ?, ?)');
                stmt.run(
                  id,
                  res[i].Symbol,
                  res[i].Date,
                  res[i].Dividend
                  );
              }
              else if (undefined !== res[i].Split) {
                stmt = transaction.prepare('INSERT INTO splits VALUES (?, ?, ?, ?)');
                stmt.run(
                  id,
                  res[i].Symbol,
                  res[i].Date,
                  res[i].Split
                  );
              }
            }
          }
          else {
            //
            // process quotes
            //
            if (content.query.results !== null) {
              res = content.query.results.quote;
              count = 0;
              sum = 0;
              for (i in res) {
                stmt = transaction.prepare('INSERT INTO quotes VALUES (?,date(?),?,?,?,?,?,?)');
                stmt.run(
                  id,
                  res[i].Date,
                  res[i].Open,
                  res[i].High,
                  res[i].Low,
                  res[i].Close,
                  res[i].Volume,
                  res[i].Adj_Close
                  );
                sum += parseFloat(res[i].Close);
                count++;
                totalCount++;
              }
              log.info('-> ' + count + ' entries inserted, sum=' + sum.toFixed(2));
            }
            else {
              log.warn('-> NO ENTRIES in ' + files[f]);
            }
          }
        }
        else {
          log.error('No matching share for file %s', files[f]);
        }
      }
      //
      // apply splits to adj_quotes table
      //
      transaction.run('INSERT INTO adj_quotes SELECT * FROM quotes');
      transaction.each('SELECT * FROM splits', function (err, row) {
        var m = parseInt(row.ratio.split(':')[0]);
        var n = parseInt(row.ratio.split(':')[1]);
        stmt = transaction.prepare(
          'UPDATE adj_quotes                ' + 
          'SET    close = ((close / ?) * ?) ' +
          'WHERE  share_id = ? AND          ' +
          '       date < ?                  '
        );
        stmt.run(m, n, row.share_id, row.date);
      });
      transaction.commit(function (err) {
        if (err) {
          log.error('commit failed');
        }
        else {
          log.info('commit successful');
        }
      });
      log.info('total count: ' + totalCount);
    });
  });
};

exports.insertUpdate = function(symbols, data) {
  var i;
  var d;
  var j;
  var share_id;
  var found;
  var timestamp;

  if (data && data.query && data.query.created && data.query.results && data.query.results.quote) {
    timestamp = data.query.created.substr(0, 17) + '00Z';
    d = data.query.results.quote;
    db.beginTransaction(function (err, transaction) {
      for (i = 0; i < d.length; i++) {
        var stmt = transaction.prepare('INSERT INTO hourly_quotes VALUES (?,?,?,?,?,?,?,?,?,?,?)');
        found = false;
        for (j = 0; j < symbols.length && found === false; j++) {
          if (symbols[j].symbol == d[i].symbol) {
            share_id = symbols[j].id;
            found = true;
          }
        }
        stmt.run(
          share_id,
          timestamp,
          d[i].Ask,
          d[i].Bid,
          d[i].Change,
          d[i].Currency,
          d[i].DaysLow,
          d[i].DaysHigh,
          d[i].LastTradeDate,
          d[i].LastTradePriceOnly,
          d[i].PreviousClose
        );
      }
      transaction.commit(function (err) {
        if (err) {
          log.error('commit failed');
        }
        else {
          log.info('commit successful');
        }
      });
    });
  }
};


})();
