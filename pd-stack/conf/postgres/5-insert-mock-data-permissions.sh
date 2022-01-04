#!/bin/bash

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    \connect politicaldilemma;

    INSERT INTO permissions (resource, action, description)
    VALUES ('auth', 'logout', 'Logout permission');
    
    INSERT INTO permissions (resource, action, description)
    VALUES ('misc', 'status', 'Status permission');

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
    VALUES ('role', 'user-assign', 'Add role assignment permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('role', 'user-remove', 'Remove role assignment permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('session', 'delete', 'Delete session permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('session', 'list', 'List session permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'change-password', 'User change password permission');

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
    VALUES ('user', 'whoami', 'Whoami users permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'block', 'Block user permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('user', 'unblock', 'Unblock user permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('regions', 'list', 'List regions permission');

    INSERT INTO permissions (resource, action, description)
    VALUES ('provinces', 'list', 'List provinces permission');
EOSQL