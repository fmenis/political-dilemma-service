CREATE TABLE IF NOT EXISTS "apiCounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "api" VARCHAR(50) NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "createdAt" timestamp DEFAULT NOW()
);