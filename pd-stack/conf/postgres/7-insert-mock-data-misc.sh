#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO "categories" (name)
    VALUES ('Decreti');

    INSERT INTO "categories" (name)
    VALUES ('Ambiente');
EOSQL