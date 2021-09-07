#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO roles (type, description)
    VALUES ('admin', 'most powerfull user');

    INSERT INTO roles (type, description)
    VALUES ('member', 'default user');

    
EOSQL