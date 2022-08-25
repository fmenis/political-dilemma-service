CREATE TABLE IF NOT EXISTS internalNotes (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ownerId" INT NOT NULL,
    "text" text NOT NULL,
    "relatedDocument" UUID NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    CONSTRAINT fk_owner_id FOREIGN KEY("ownerId") REFERENCES users("id") ON DELETE NO ACTION
);