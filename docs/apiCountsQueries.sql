
-- count api
SELECT api, count(id), 
	   avg("responseTime")::numeric(10,3) as "avarageResTime",
	   max("responseTime")::numeric(10,3) as "slowestResTime",
	   min("responseTime")::numeric(10,3) as "fastestResTime"
FROM "apiAudit"
GROUP BY api
ORDER BY count(id) DESC

-- from the avg most slow 
SELECT api, avg("responseTime")::numeric(10,3) as "avarageResTime", count(id)
FROM "apiAudit"
GROUP BY api
ORDER BY "avarageResTime" DESC


-- responseTime for a single api, order by slowest
SELECT api, "responseTime"
FROM "apiAudit"
WHERE api = 'get-authenticated-user'
ORDER BY "responseTime" DESC

-- TODO aggiungere query per range

-- TODO aggiungere query ritornare risposte diverse da 200