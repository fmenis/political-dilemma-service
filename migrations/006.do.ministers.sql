CREATE TABLE IF NOT EXISTS "legislature" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) UNIQUE NOT NULL,
    "startDate" DATE,
    "endDate" DATE,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ministry" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "legislatureId" UUID NOT NULL,
    "politicianId" UUID NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW(),
    UNIQUE ("name", "legislatureId"),
    UNIQUE ("politicianId", "legislatureId"),
    CONSTRAINT fk_legislature_id FOREIGN KEY("legislatureId") REFERENCES "legislature"("id") ON DELETE NO ACTION,
    CONSTRAINT fk_politician_id FOREIGN KEY("politicianId") REFERENCES "politician"("id") ON DELETE NO ACTION
);