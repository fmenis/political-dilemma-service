#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER dev with password 'password';
    CREATE DATABASE politicaldilemma WITH OWNER dev;

    \connect politicaldilemma;

    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        user_name VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR (60) NOT NULL,
        bio VARCHAR (500),
        is_blocked BOOLEAN DEFAULT false,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp
    );

    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dev;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dev;
EOSQL