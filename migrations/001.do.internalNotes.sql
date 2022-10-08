CREATE TABLE IF NOT EXISTS "internalNotes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ownerId" INT,
    "text" text NOT NULL,
    "relatedDocumentId" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL CHECK ("category" in ('articles', 'activities')),
    "createdAt" timestamp DEFAULT NOW(),
    CONSTRAINT fk_owner_id FOREIGN KEY("ownerId") REFERENCES users("id") ON DELETE SET NULL
);