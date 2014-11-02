# Die Summer aller Aktien * Preis pro Tag
SELECT   quotes.date, 
         ROUND(SUM(quotes.close * positions.count), 2)
FROM     positions, quotes
WHERE    quotes.share_id=positions.share_id AND
         quotes.date > positions.buying_date
GROUP BY quotes.date

SELECT shares.name,
       positions.count,
       positions.buying_date
FROM   shares, positions
WHERE  shares.id = positions.share_id

SELECT   quotes.date AS date,
         quotes.close AS close
FROM     shares, quotes 
WHERE    shares.symbol="DAP.F"
AND      strftime("%s", quotes.date) > strftime("%s", date("now", "-2 years"))
AND      quotes.share_id=shares.id
ORDER BY quotes.date

SELECT   *
FROM     quotes
GROUP BY share_id

# finde die letzten (neusten) Kurse für alle Positionen
SELECT   quotes.share_id,
         positions.symbol,
         quotes.date,
         MAX(strftime("%s", quotes.date)),
         quotes.close
FROM     quotes,
         positions
WHERE    quotes.share_id=positions.share_id
GROUP BY quotes.share_id

# Alle Aktien in einem Depot
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