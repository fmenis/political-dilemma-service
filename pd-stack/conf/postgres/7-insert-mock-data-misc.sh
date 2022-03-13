#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO "articleCategories" (name)
    VALUES ('Decreti');

    INSERT INTO "articleCategories" (name)
    VALUES ('Parlamentari');
EOSQL