#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked)
    VALUES ('Dennis', 'Boanini', 'Il Boa', 'dennis@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti', false);  

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked)
    VALUES ('Filippo', 'Menis', 'Pippo', 'filippo@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti', false);

    INSERT INTO users (first_name, last_name, user_name, email, password, is_blocked)
    VALUES ('Gaetano', 'Danelli', 'MaiSenzaPigiama', 'gaetano@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti', false);  
EOSQL