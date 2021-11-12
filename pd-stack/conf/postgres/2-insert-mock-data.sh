#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked)
    VALUES ('Dennis', 'Boanini', 'Il Boa', 'dennis@acme.com', '\$2b\$10\$ZKrAs9N9frJJZauS2qJEHuoFwXuTEfZuvVG0LXZ/gSZZ9wnEm2cfu', false);  

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked)
    VALUES ('Filippo', 'Menis', 'Pippo', 'fiippo@acme.com', '\$2b\$10\$ZKrAs9N9frJJZauS2qJEHuoFwXuTEfZuvVG0LXZ/gSZZ9wnEm2cfu', false);

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked)
    VALUES ('Gaetano', 'Danelli', 'MaiSenzaPigiama', 'gaetano@acme.com', '\$2b\$10\$ZKrAs9N9frJJZauS2qJEHuoFwXuTEfZuvVG0LXZ/gSZZ9wnEm2cfu', false);  
EOSQL