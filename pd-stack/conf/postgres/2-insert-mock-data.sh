#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked, owner_id)
    VALUES ('Dennis', 'Boanini', 'Il Boa', 'dennis@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti', false, 1);  

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked, owner_id)
    VALUES ('Filippo', 'Menis', 'Pippo', 'filippo@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti', false, 2);

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked, owner_id)
    VALUES ('Gaetano', 'Danelli', 'MaiSenzaPigiama', 'gaetano@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti', false, 3);  
EOSQL