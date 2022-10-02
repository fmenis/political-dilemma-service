CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    ownership CHAR(3) CHECK (ownership in ('any', 'own')),
    description VARCHAR(200) NOT NULL,
    created_at timestamp DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    created_at timestamp DEFAULT NOW(),
    CONSTRAINT fk_role_id FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_permission_id FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS users_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assign_by INT NOT NULL,
    created_at timestamp DEFAULT NOW(),
    CONSTRAINT fk_user_id FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE NO ACTION,
    CONSTRAINT fk_role_id FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE NO ACTION,
    CONSTRAINT fk_assign_by FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE NO ACTION
);