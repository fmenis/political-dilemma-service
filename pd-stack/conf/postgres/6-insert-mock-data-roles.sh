#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO roles (name, description)
    VALUES ('Root', 'Full access');

    INSERT INTO permissions_roles (role_id, permission_id)
    VALUES (1, 1), (1, 2), (1, 3),(1, 4),(1, 5),(1, 6),(1, 7),(1, 8),(1, 9),(1, 10),(1, 11),(1, 12),(1, 13),(1, 14),(1, 15),(1, 16),(1, 17),(1, 18),(1, 19),(1, 20),(1, 21),(1, 22),(1, 23),(1, 24), (1,25), (1,26);

    INSERT INTO users_roles (user_id, role_id, assign_by)
    VALUES (1, 1, 1);

    INSERT INTO users_roles (user_id, role_id, assign_by)
    VALUES (2, 1, 2);

    INSERT INTO users_roles (user_id, role_id, assign_by)
    VALUES (3, 1, 3);
EOSQL