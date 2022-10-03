#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO permissions (resource, action, description)
    VALUES ('permission', 'create', 'Create permisssion permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('permission', 'delete', 'Delete permisssion permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('permission', 'list', 'List permisssion permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('permission', 'update', 'Update permisssion permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'create', 'Create role permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'delete', 'Delete role permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'list', 'List role permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'add-permission', 'Add role permissions permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'remove-permission', 'Remove role permissions permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'update', 'Update role permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'read', 'Read role');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'user-assign', 'Assign role to a user');

    INSERT INTO permissions (resource, action, description)
    VALUES ('session', 'list', 'List session permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'create', 'User create permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'delete', 'User delete permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'list', 'List users permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'read', 'Read users permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'update', 'Update users permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'block', 'Block user permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'unblock', 'Unblock user permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('article', 'create', 'Article create permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('article', 'list', 'Article list permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('article', 'delete', 'Article delete permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('article', 'read', 'Article read permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('article', 'update', 'Article update permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('article', 'review', 'Article review permission');
    
    INSERT INTO permissions (resource, action, description)
    VALUES ('article', 'approve', 'Article approve permission');
EOSQL