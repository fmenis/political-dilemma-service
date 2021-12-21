#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER dev with password 'password';
    CREATE DATABASE politicaldilemma WITH OWNER dev;

    \connect politicaldilemma;

    CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        user_name VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(60) NOT NULL,
        birth_date timestamp CHECK (birth_date > '1900-01-01'),
        joined_date timestamp CHECK (joined_date > birth_date),
        sex VARCHAR(10) CHECK (sex in ('male', 'female', 'other')),
        bio VARCHAR (500),
        owner_id INT NOT NULL,
        is_blocked BOOLEAN NOT NULL DEFAULT false,
        is_deleted BOOLEAN NOT NULL DEFAULT false,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW(),
        updated_by INT,
        deleted_by INT,
        CONSTRAINT fk_owner_id FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE NO ACTION,
        CONSTRAINT fk_updated_by FOREIGN KEY(updated_by) REFERENCES users(id) ON DELETE NO ACTION,
        CONSTRAINT fk_deleted_by_by FOREIGN KEY(deleted_by) REFERENCES users(id) ON DELETE NO ACTION
    );

    CREATE INDEX idx_first_name
    ON users(first_name);

    CREATE INDEX idx_last_name
    ON users(last_name);

    CREATE INDEX idx_email
    ON users(email);

    CREATE INDEX idx_user_name 
    ON users(user_name);

    CREATE TABLE IF NOT EXISTS permissions (
        id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        ownership CHAR(3) CHECK (ownership in ('any', 'own')),
        description VARCHAR(200) NOT NULL,
        created_at timestamp DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        name VARCHAR(50) NOT NULL,
        description VARCHAR(200) NOT NULL,
        created_at timestamp DEFAULT NOW(),
        updated_at timestamp DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS permissions_roles (
        id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at timestamp DEFAULT NOW(),
        CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE NO ACTION,
        CONSTRAINT fk_permission FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE NO ACTION
    );

    CREATE TABLE IF NOT EXISTS users_roles (
        id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        created_at timestamp DEFAULT NOW(),
        CONSTRAINT fk_role FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE NO ACTION,
        CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE NO ACTION
    );
    

    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dev;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO dev;
EOSQL