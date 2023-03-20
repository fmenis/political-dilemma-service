CREATE TABLE IF NOT EXISTS "politician" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "externalId" INT NOT NULL,
    "firstName" VARCHAR(50) NOT NULL,
    "lastName" VARCHAR(50) NOT NULL,
    "gender" VARCHAR(10) NOT NULL CHECK (gender in ('MALE', 'FEMALE', 'OTHER')),
    "birthDate" DATE NOT NULL CHECK ("birthDate" > '1900-01-01'),
    "birthCity" VARCHAR(50) NOT NULL,
    "img" VARCHAR(255) NOT NULL,
    "link" VARCHAR(255) NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW()
);