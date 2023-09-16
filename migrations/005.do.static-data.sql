CREATE TABLE IF NOT EXISTS "group" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "externalId" INT UNIQUE NOT NULL,
    "name" VARCHAR(250) UNIQUE NOT NULL,
    "startDate" DATE NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "politician" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "externalId" INT UNIQUE NOT NULL,
    "type" VARCHAR(10) NOT NULL CHECK (type in ('SENATOR', 'DEPUTY')),
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "gender" VARCHAR(10) NOT NULL CHECK (gender in ('MALE', 'FEMALE', 'OTHER')),
    "birthDate" DATE NOT NULL CHECK ("birthDate" > '1900-01-01'),
    "birthCity" VARCHAR(50) NOT NULL,
    "img" VARCHAR(255),
    "link" VARCHAR(255) UNIQUE NOT NULL,
    "groupId" UUID NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW(),
    CONSTRAINT fk_group_id FOREIGN KEY("groupId") REFERENCES "group"("id") ON DELETE NO ACTION
);