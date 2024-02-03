CREATE TABLE IF NOT EXISTS "legislature" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(10) UNIQUE NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ministry" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "ministerFullName" VARCHAR(100) NOT NULL,
    "legislatureId" UUID NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW(),
    UNIQUE ("name", "ministerFullName"),   
    CONSTRAINT fk_legislature_id FOREIGN KEY("legislatureId") REFERENCES "legislature"("id") ON DELETE NO ACTION
);