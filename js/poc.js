(function() {


'use strict';

var db;
var stmt;
var sqlite3             = require("sqlite3").verbose();
var TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;

var table =
  'id            INTEGER,                  ' +
  'name          TEXT,                     ' +
  'description   TEXT,                     ' +
  'PRIMARY KEY   (name)                    ';

/**
  * collection of sqlite errors
  */
function pocDatabaseErrors() {

  var dbError = function(error) {
    console.error(error);
  };

  db = new TransactionDatabase(
    new sqlite3.Database('../db/test.sqlite', function (err) {
      if (null !== err) {
        console.error('error opening database file: %s', JSON.stringify(err));
      }
    })
  );
  stmt = db.prepare('DROP TABLE poc');
  stmt.run();
  stmt.finalize();

  stmt = db.prepare('CREATE TABLE poc (' + table + ')');
  stmt.run();
  stmt.finalize();


  // SQLITE_ERROR: table poc has 3 columns but 4 values were supplied] errno: 1, code: 'SQLITE_ERROR'
  db.run('INSERT INTO poc VALUES (1, "foo", "bar", "error")', function(error) {
    dbError(error);
  });


  // SQLITE_ERROR: table poc has 3 columns but 4 values were supplied] errno: 1, code: 'SQLITE_ERROR'
  stmt = db.prepare('INSERT INTO poc VALUES (?, ?, ?, ?)', function(error) {
    dbError(error);
  });


  // SQLITE_RANGE: bind or column index out of range] errno: 25, code: 'SQLITE_RANGE'
  stmt = db.prepare('INSERT INTO poc VALUES (?, ?, ?)', function(error) {
    dbError(error);
  });
  stmt.run([1, 2, 3, 4], function(error) {
    dbError(error);
  });


  // SQLITE_ERROR: no such table: not_existent] errno: 1, code: 'SQLITE_ERROR'
  db.run('INSERT INTO not_existent VALUES (1,"foo","bar")', function(error) {
    dbError(error);
  });


  // SQLITE_ERROR: no such column: not_existent] errno: 1, code: 'SQLITE_ERROR'
  db.run('SELECT not_existent FROM poc', function(error) {
    dbError(error);
  });


  stmt.finalize();

  db.close();
}

/**
  * create a pretty formated local date for e. g. logging
  */
function getPrettyDate() {
  var d = new Date();
  var s;
  var fill = function(n, m) {
    var s = '';
    while (n.length + s.length < m) {
      s+= '0';
    }
    return s+n;
  };

  return fill( d.getFullYear()  .toString(), 4) + '-' +
         fill((d.getMonth() + 1).toString(), 2) + '-' +
         fill( d.getDate()      .toString(), 2) + ' ' +
         fill( d.getHours()     .toString(), 2) + ':' +
         fill( d.getMinutes()   .toString(), 2) + ':' +
         fill( d.getSeconds()   .toString(), 2);

}

function pocPrettyDate() {
  console.log(getPrettyDate());
}

pocDatabaseErrors();

})();