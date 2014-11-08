(function() {

var db;
var fs      = require('fs');
var sqlite3 = require("sqlite3").verbose();
var transactionDatabase = require('sqlite3-transactions').TransactionDatabase;

exports.open = function(file){
  db = new transactionDatabase(
    new sqlite3.Database(file)
  );
};

exports.clear = function(tables)
{
  db.serialize(function() {
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
  db.serialize(function() {
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
  db.serialize(function(){
    var stmt;
    var table;
    var sql;
    var i;
    var j;
    var v; // array of values inserted
    var q; // array of questions marks added to the INSERT statement

    var callback = function() {
      console.log(this.sql);
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
        for (i=0; i < tables[table].data.length; i++){
          v = [];
          for (j in tables[table].data[i]) {
            v.push(tables[table].data[i][j]);
          }
          console.log(stmt.sql + ' ' + JSON.stringify(v) + '(' + v.length + ')');
          stmt.simon = JSON.stringify(v);
          stmt.run(v, callback);
        }
        stmt.finalize();
      }
    }
  });
};

exports.getTables = function() {
  var stmt = db.prepare('SELECT * FROM sqlite_master');
  stmt.all(function (err, rows) {
    if (err) {
      console.log(err);
    }
    else {
      var r = rows;
    }
  });
};

exports.close = function()
{
  db.serialize(function(){
    db.close();
  });
};

exports.test = function(){
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
      console.log(err);
    }
    else {
      sum = 0;
      for (var i in rows) {
        rows[i].sum = (rows[i].close * rows[i].count).toFixed(2);
        console.log(JSON.stringify(rows[i]));
        sum += (rows[i].close * rows[i].count);
      }
      console.log(sum);
    }
  });
};

exports.getDepots = function(callback){
  var stmt;
  stmt = db.prepare(
    'SELECT   id,         ' +
    '         name,       ' +
    '         description ' +
    'FROM     depots      ' +
    'ORDER BY id          ');
  stmt.all(function (err, rows) {
    if (err) {
      console.log(err);
    }
    else {
      callback(rows);
    }
  });
};

exports.getDepot = function(depot, callback){
  var stmt;
  stmt  = db.prepare(
    'SELECT   positions_id  ' +
    'FROM     depot         ' +
    'WHERE    depot_id=?    ' +
    'ORDER BY positions_id  ');
  stmt.all(depot, function (err, rows) {
    if (err) {
      console.log(err);
    }
    else{
      callback(rows);
    }
  });
};

exports.getPositions = function(depot, callback){
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
    // 'AND      positions.selling_date=""           ' +
    'GROUP BY shares.id                           ' +
    'ORDER BY shares.name                         ');
  stmt.all(depot, function (err, rows) {
    if (err) {
      console.log(err);
    }
    else{
      callback(rows);
    }
  });
};

exports.getQuotes = function(symbol, callback){
  var stmt = db.prepare(
    'SELECT   strftime("%s", quotes.date) * 1000 AS date,                           ' +
    '         quotes.close AS close                                                 ' +
    // '         positions.count AS count,                                             ' +
    'FROM     shares, quotes                                                        ' +
    'WHERE    shares.symbol=?                                                       ' +
    'AND      strftime("%s", quotes.date) > strftime("%s", date("now", "-3 years")) ' +
    'AND      quotes.share_id=shares.id                                             ' +
    'ORDER BY quotes.date                                                           ');
  stmt.all(symbol, function (err, rows) {
    var a = [];
    var i;
    if (err) {
      console.log(err);
    }
    else {
      for (i in rows) {
        a.push([rows[i].date, rows[i].close]);
      }
      callback(a);
    }
  });
};

exports.getShare = function(symbol, callback){
  var stmt = db.prepare(
    'SELECT *       ' +
    'FROM   shares  ' +
    'WHERE  symbol=?');
  stmt.all(symbol, function (err, rows) {
    callback(rows);
  });
};

exports.dumpFiles = function(){
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
    stmt.all(function(err, rows) {
    db.beginTransaction(function(err, transaction) {
      var i;
      var f;

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
            // close = parseFloat(res[i].Close);
            // if (isNaN(close)) {
            //   console.log('***** ERROR: %s %s is NaN: %d', symbol, res[i].Date, close);
            // }

            stmt = transaction.prepare('INSERT INTO quotes VALUES (NULL,?,date(?),?,?,?,?,?,?)');
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
          stmt.finalize();
          console.log('  -> ' + count + ' entries inserted, sum=' + sum.toFixed(2));
        }
      }
      transaction.commit(function (err) {
        if (err) {
          console.log('commit failed');
        }
        else {
          console.log('commit successful');
        }
      });
      console.log('total count: ' + totalCount);
    });
  });
};

})();
