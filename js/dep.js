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
