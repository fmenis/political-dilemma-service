#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO users (first_name, last_name, user_name, email, type, password, owner_id, id_region, id_province)
    VALUES ('Dennis', 'Boanini', 'Il Boa', 'dennis@acme.com', 'backoffice', '\$2b\$10\$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a', 1, 12, 36);  

    INSERT INTO users (first_name, last_name, user_name, email, type, password, owner_id, id_region, id_province)
    VALUES ('Filippo', 'Menis', 'Pippo', 'filippomeniswork@gmail.com', 'backoffice', '\$2b\$10\$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a', 2, 15, 102);

    INSERT INTO users (first_name, last_name, user_name, email, type, password, owner_id, id_region, id_province)
    VALUES ('Gaetano', 'Danelli', 'MaiSenzaPigiama', 'gaetano@acme.com', 'backoffice', '\$2b\$10\$5i8SB6NIqTGbx7qqU0l3lOHYfH5BuKPp4UTe4YCp1JffL6p426b2a', 3, 19, 58);
EOSQL