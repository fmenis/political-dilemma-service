#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO users (first_name, last_name, user_name, email, password, owner_id)
    VALUES ('Dennis', 'Boanini', 'Il Boa', 'dennis@acme.com', '\$2b\$10\$oh8HpfhMWtwGB2KRFokb7uXlHCJgFsrlPtG0hBAewnUGTsL.fC/IW', 1);  

    INSERT INTO users (first_name, last_name, user_name, email, password, owner_id)
    VALUES ('Filippo', 'Menis', 'Pippo', 'filippo@acme.com', '\$2b\$10\$oh8HpfhMWtwGB2KRFokb7uXlHCJgFsrlPtG0hBAewnUGTsL.fC/IW', 2);

    INSERT INTO users (first_name, last_name, user_name, email, password, owner_id)
    VALUES ('Gaetano', 'Danelli', 'MaiSenzaPigiama', 'gaetano@acme.com', '\$2b\$10\$oh8HpfhMWtwGB2KRFokb7uXlHCJgFsrlPtG0hBAewnUGTsL.fC/IW', 3);  
EOSQL