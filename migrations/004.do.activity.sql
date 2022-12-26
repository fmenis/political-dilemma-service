CREATE TABLE IF NOT EXISTS "activity" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" VARCHAR(100) NOT NULL CHECK ("type" in ('DECRETO_LEGGE', 'DECRETO_MINISTERIALE', 'LEGGE_ORDINARIA', 'DECRETO_DEL_PRESIDENTE_DEL_CONSIGLIO_DEI_MINISTRI')),
    "shortType" VARCHAR(4) NOT NULL CHECK ("shortType" in ('DL', 'DM', 'I', 'DPCM')),
    "title" VARCHAR(200) UNIQUE NOT NULL,
    "description" TEXT,
    "text" TEXT,
    "status" VARCHAR(50) NOT NULL CHECK (status in ('DRAFT', 'IN_REVIEW', 'READY', 'PUBLISHED', 'REWORK', 'ARCHIVED', 'DELETED')),
    "rating" DOUBLE PRECISION,
    "linkGazzettaUfficiale" VARCHAR(500),
    "dataPubblicazioneInGazzetta" timestamp,
    "categoryId" UUID NOT NULL,
    "ownerId" UUID,
    "tags" TEXT [],
    "cancellationReason" TEXT,
    "publishedAt" timestamp,
    "deletedAt" timestamp,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW(),
    CONSTRAINT fk_owner_id FOREIGN KEY("ownerId") REFERENCES users("id") ON DELETE SET NULL,
    CONSTRAINT fk_category_id FOREIGN KEY("categoryId") REFERENCES categories("id") ON DELETE NO ACTION
);

ALTER TABLE files ADD COLUMN "activityId" UUID;
ALTER TABLE files ADD CONSTRAINT fk_activity_id FOREIGN KEY("activityId") REFERENCES activity(id) ON DELETE CASCADE;
ALTER TABLE files DROP CONSTRAINT files_category_check;
ALTER TABLE files ADD CONSTRAINT files_category_check CHECK (category in ('ARTICLE_IMAGE', 'ACTIVITY_IMAGE'));