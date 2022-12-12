CREATE TABLE IF NOT EXISTS "activity" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL CHECK (type in ('DECRETO_LEGGE', 'DECRETO_MINISTERIALE', 'LEGGE_ORDINARIA')),
    "title" VARCHAR(200) UNIQUE NOT NULL,
    "description" TEXT,
    "text" TEXT,
    "status" VARCHAR(50) NOT NULL CHECK (status in ('DRAFT', 'IN_REVIEW', 'READY', 'PUBLISHED', 'REWORK', 'ARCHIVED', 'DELETED')),
    "rating" INT, -- TODO capire se INT dopo analisi
    "categoryId" UUID NOT NULL,
    "ownerId" UUID,
    -- TODO capire se serve anche il type abbreviato
    "tags" TEXT [],
    "cancellationReason" TEXT,
    "publishedAt" timestamp,
    "deletedAt" timestamp,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW(),
    CONSTRAINT fk_owner_id FOREIGN KEY("ownerId") REFERENCES users("id") ON DELETE SET NULL,
    CONSTRAINT fk_category_id FOREIGN KEY("categoryId") REFERENCES categories("id") ON DELETE NO ACTION
);