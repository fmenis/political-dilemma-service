CREATE TABLE IF NOT EXISTS "apiCounts" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "api" VARCHAR(50) UNIQUE NOT NULL,
    "count" INT NOT NULL
);