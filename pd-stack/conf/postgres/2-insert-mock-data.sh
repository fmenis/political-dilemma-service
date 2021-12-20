#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO users (first_name, last_name, user_name, email, password)
    VALUES ('Dennis', 'Boanini', 'Il Boa', 'dennis@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti');  

    INSERT INTO users (first_name, last_name, user_name, email, password)
    VALUES ('Filippo', 'Menis', 'Pippo', 'filippo@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti');

    INSERT INTO users (first_name, last_name, user_name, email, password)
    VALUES ('Gaetano', 'Danelli', 'MaiSenzaPigiama', 'gaetano@acme.com', '\$2b\$10\$wqXwWprQ6i6HS5ygo2DCWu4yJnkYzXFHYvSiFYnaqQNN0m7YoCqti');  
EOSQL