const query = `PREFIX ocd: <http://dati.camera.it/ocd/>
PREFIX osr: <http://dati.senato.it/osr/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT DISTINCT ?nomeGruppo ?inizio
WHERE
{
    ?gruppo osr:denominazione ?denominazione.
    ?denominazione osr:titolo ?nomeGruppo.
    ?denominazione osr:inizio ?inizio.
   
}
ORDER BY ?nomeGruppo`
