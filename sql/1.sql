# Summe Kurs x Anzahl pro Tag
# sum of the valule of all shares multiplied by the count in a depot 
CREATE TABLE sum AS
SELECT   shares.symbol AS symbol,
         positions.id AS positions_id,
         quotes.date AS date,
         ROUND(SUM(quotes.close * positions.count), 2) AS sum
FROM     depots, depot, positions, shares, quotes
WHERE    depot.depot_id = 0 AND
         (positions.selling_date == "" OR quotes.date < positions.selling_date) AND
         quotes.date >= positions.buying_date AND
         quotes.share_id = shares.id AND
         shares.id = positions.share_id AND
         positions.id = depot.positions_id AND
         depot.depot_id = depots.id
GROUP BY positions.id,
         quotes.date
ORDER BY quotes.date
         
SELECT   count(*),
         sum.date,
         ROUND(SUM(sum.sum), 2)
FROM     sum
GROUP BY date

# which shares have been in a depot (here "0") on a certain day
SELECT   shares.symbol,
         shares.name,
         positions.buying_date
FROM     depots, depot, positions, shares
WHERE    depots.id = 0 AND
         depot.depot_id = depots.id AND
         depot.positions_id = positions.id AND
         positions.share_id = shares.id AND
         positions.buying_date <= "2012-07-11" AND
         (positions.selling_date = "" OR positions.selling_date > "2012-07-11")


# shares sorted by buying date in depot "0"
SELECT   shares.symbol,
         shares.name,
         positions.buying_date,
         positions.selling_date,
         ROUND(positions.buying_price * positions.count, 2) AS buy,
         ROUND(positions.selling_price * positions.count, 2) AS sell
FROM     depots, depot, positions, shares
WHERE    depots.id = 0 AND
         depots.id = depot.depot_id AND
         depot.positions_id = positions.id AND
         positions.share_id = shares.id
ORDER BY positions.buying_date

# find the latest quotes for all positions
SELECT   shares.name,
         quotes.share_id,
         positions.symbol,
         quotes.date,
         MAX(strftime("%s", quotes.date)),
         ROUND(julianday("now") - julianday(quotes.date)),
         quotes.close
FROM     shares, quotes, positions
WHERE    quotes.share_id=positions.share_id AND
         quotes.share_id = shares.id
GROUP BY quotes.share_id

# all shares in a depot
SELECT 
         positions.symbol,
         positions.count,
         positions.buying_price,
         positions.buying_date,
         positions.selling_price,
         positions.selling_date,
         shares.id,
         shares.symbol,
         shares.name,
         shares.isin,
         shares.wkn
FROM     depots, depot, positions, shares
WHERE    depot.depot_id="0"
AND      depots.id=depot.depot_id
AND      depot.positions_id=positions.id
AND      positions.share_id=shares.id
AND      positions.selling_date=""
ORDER BY shares.name

# apply splits and create new table adj_quotes
CREATE TABLE adj_quotes AS SELECT * FROM quotes

UPDATE   adj_quotes
SET      close = close / 5
WHERE    share_id = 35 AND
         date < "2014-01-02"
