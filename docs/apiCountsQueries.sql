
-- count api
SELECT api, count(id), 
	   avg("responseTime")::numeric(10,3) as "avarageResTime",
	   max("responseTime")::numeric(10,3) as "slowestResTime",
	   min("responseTime")::numeric(10,3) as "fastestResTime"
FROM "apiCounts"
GROUP BY api
ORDER BY count(id) DESC

-- from the avg most slow 
SELECT api, avg("responseTime")::numeric(10,3) as "avarageResTime", count(id)
FROM "apiCounts"
GROUP BY api
ORDER BY "avarageResTime" DESC


-- responseTime for a single api, order by slowest
SELECT api, "responseTime"
FROM "apiCounts"
WHERE api = 'get-authenticated-user'
ORDER BY "responseTime" DESC