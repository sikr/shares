/******************************************************************************
 *
 *
 *
 *
 */
fillDatabase = function()
{
  var stmt = db.prepare("INSERT INTO shares VALUES (?, 'SAP AG', 'DE0007164600')");
  stmt.run();
  stmt.finalize();
  stmt = db.prepare("INSERT INTO shares VALUES (?, 'GEA Group AG', 'DE0006602006')");
  stmt.run();
  stmt.finalize();

  stmt = db.prepare("INSERT INTO positions VALUES (?, 1, 'SAP.F', 'Frankfurt', 8, 33.25, date('2008-07-03'), 0, 0)");
  stmt.run();
  stmt.finalize();
  stmt = db.prepare("INSERT INTO positions VALUES (?, 1, 'SAP.F', 'Frankfurt', 10, 28.60, date('2009-07-10'), 0, 0)");
  stmt.run();
  stmt.finalize();
  stmt = db.prepare("INSERT INTO positions VALUES (?, 1, 'SAP.F', 'Frankfurt', 21, 35.12, date('2010-08-20'), 0, 0)");
  stmt.run();
  stmt.finalize();
  stmt = db.prepare("INSERT INTO positions VALUES (?, 1, 'SAP.F', 'Frankfurt', 7, 56.33, date('2013-08-20'), 0, 0)");
  stmt.run();
  stmt.finalize();

  db.each("SELECT * FROM positions", function(err, row) {
      console.log(row.share_id + ": count=" + row.count + ", buying_price=" + row.buying_price + ", buying_date=" + row.buying_date + ", total_buying_price=" + row.count * row.buying_price);
  //      console.log(row);
  });

  var res;
/*
  var requestOptions = {
    host: 'query.yahooapis.com',
    path: '/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20(%22SAP.F%22)%20and%20startDate%20=%20%222010-01-01%22%20and%20endDate%20=%20%222010-12-31%22&env=http://datatables.org%2Falltables.env&format=json',
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
      console.log(str);
      res = JSON.parse(str);

      for (i in res.query.results.quote)
      {
        console.log("date=" + res.query.results.quote[i].date);
      }

    });
  }

  http.request(requestOptions, callback).end();
*/
  res = require('./result.json').query.results.quote;

  for (i in res)
  {
    stmt = db.prepare("INSERT INTO data VALUES (1, date('" + res[i].Date + "'), " + res[i].Open + ", " + res[i].High + ", " + res[i].Low + ", " + res[i].Close + ", " + res[i].Volume + ", " + res[i].Adj_Close + ")");
    console.log(stmt.sql);
    stmt.run();
    stmt.finalize();
  }
}


//createDatabase();
//fillDatabase();
/*
db.each("SELECT * FROM positions", function(err, row) {
    console.log(row.share_id + ": count=" + row.count + ", buying_price=" + row.buying_price + ", buying_date=" + row.buying_date + ", total_buying_price=" + row.count * row.buying_price);
//      console.log(row);
});
db.each("SELECT share_id, date, close FROM data ORDER BY date", function(err, row) {
    console.log(row.share_id + ": date=" + row.date + ", close=" + row.close);
//      console.log(row);
});
*/
/*
for (var i in valuesShares)
{
  console.log(valuesShares[i].id + ', ' + valuesShares[i].isin + ', ' + valuesShares[i].wkn + ', ' + valuesShares[i].name);
}
*/
/*
var r = [];
var v = valuesPositions;
for (i in v)
{
  if (v[i].symbol.length > 0)
  {
    if (r[v[i].share_id] == undefined)
    {
      r[v[i].share_id] = {};
      r[v[i].share_id].symbol       = v[i].symbol;
      r[v[i].share_id].buying_date  = v[i].buying_date;
      if (v[i].selling_date.length > 0)
      {
        r[v[i].share_id].selling_date = v[i].selling_date;
      }
    }
    else
    {
      var date1 = new Date(r[v[i].share_id].buying_date);
      var date2 = new Date(v[i].buying_date);
      if (date1 > date2)
      {
        r[v[i].share_id].buying_date = v[i].buying_date;
      }

      if (r[v[i].share_id].selling_date != undefined)
      {
        if (v[i].selling_date.length == 0)
        {
          delete(r[v[i].share_id].selling_date);
        }
        else
        {
          date1 = new Date(r[v[i].share_id].selling_date);
          date2 = new Date(v[i].selling_date);
          if (date1 < date2)
          {
            console.log('update...');
            r[v[i].share_id].selling_date = v[i].selling_date;
          }
        }
      }
    }
  }
}
for (i in r)
{
  console.log(r[i].symbol + ': ' + r[i].buying_date + ', ' + r[i].selling_date);
}

closeDatabase();
*/