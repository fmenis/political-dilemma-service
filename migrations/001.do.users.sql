
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS provinces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    code CHAR(2) UNIQUE NOT NULL,
    id_region UUID NOT NULL,
    CONSTRAINT fk_id_region FOREIGN KEY(id_region) REFERENCES regions(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type in ('backoffice', 'site')),
    password VARCHAR(60) NOT NULL,
    birth_date timestamp CHECK (birth_date > '1900-01-01'),
    joined_date timestamp CHECK (joined_date > birth_date),
    sex VARCHAR(10) CHECK (sex in ('male', 'female', 'other')),
    bio VARCHAR (500),
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW(),
    last_access timestamp,
    id_region UUID NOT NULL,
    id_province UUID NOT NULL,
    CONSTRAINT fk_id_region FOREIGN KEY(id_region) REFERENCES regions(id) ON DELETE NO ACTION,
    CONSTRAINT fk_id_province FOREIGN KEY(id_province) REFERENCES provinces(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR(50) NOT NULL,
    user_agent TEXT NOT NULL,
    created_at timestamp NOT NULL DEFAULT NOW(),
    expired_at timestamp NOT NULL,
    last_active timestamp NOT NULL DEFAULT NOW(),
    is_valid BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS reset_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    link VARCHAR(250) NOT NULL
    already_used BOOLEAN NOT NULL DEFAULT false,
    expired_at timestamp NOT NULL,
    created_at timestamp DEFAULT NOW(),
    CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE NO ACTION
);