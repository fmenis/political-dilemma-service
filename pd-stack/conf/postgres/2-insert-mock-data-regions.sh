#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO regions (name) VALUES ('Marche');
    INSERT INTO regions (name) VALUES ('Abruzzo');
    INSERT INTO regions (name) VALUES ('Basilicata');
    INSERT INTO regions (name) VALUES ('Molise');
    INSERT INTO regions (name) VALUES ('Trentino Alto Adige');
    INSERT INTO regions (name) VALUES ('Puglia');
    INSERT INTO regions (name) VALUES ('Calabria');
    INSERT INTO regions (name) VALUES ('Campania');
    INSERT INTO regions (name) VALUES ('Lazio');
    INSERT INTO regions (name) VALUES ('Sardegna');
    INSERT INTO regions (name) VALUES ('Sicilia');
    INSERT INTO regions (name) VALUES ('Toscana');
    INSERT INTO regions (name) VALUES ('Piemonte');
    INSERT INTO regions (name) VALUES ('Emilia Romagna');
    INSERT INTO regions (name) VALUES ('Friuli Venezia Giulia');
    INSERT INTO regions (name) VALUES ('Valle d''Aosta');
    INSERT INTO regions (name) VALUES ('Veneto');
    INSERT INTO regions (name) VALUES ('Liguria');
    INSERT INTO regions (name) VALUES ('Lombardia');
    INSERT INTO regions (name) VALUES ('Umbria');
EOSQL