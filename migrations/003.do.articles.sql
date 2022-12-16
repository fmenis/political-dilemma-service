CREATE TABLE IF NOT EXISTS "categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) UNIQUE NOT NULL,
    "description" TEXT,
    "type" VARCHAR(20) NOT NULL CHECK (type in ('ARTICLE', 'ACTIVITY')),
    "createdAt" timestamp DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "articles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) UNIQUE NOT NULL,
    "text" TEXT,
    "description" TEXT,
    "cancellationReason" TEXT,
    "status" VARCHAR(50) NOT NULL CHECK (status in ('DRAFT', 'IN_REVIEW', 'READY', 'PUBLISHED', 'REWORK', 'ARCHIVED', 'DELETED')),
    "tags" TEXT [],
    "categoryId" UUID NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW(),
    "ownerId" UUID,
    "publishedAt" timestamp,
    "deletedAt" timestamp,
    CONSTRAINT fk_owner_id FOREIGN KEY("ownerId") REFERENCES users("id") ON DELETE SET NULL,
    CONSTRAINT fk_category_id FOREIGN KEY("categoryId") REFERENCES categories("id") ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS files (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "articleId" UUID,
    "fullPath" VARCHAR(200) NOT NULL,
    "url" VARCHAR(200) UNIQUE NOT NULL,
    "fileName" VARCHAR(50) NOT NULL,
    "extension" VARCHAR(10) NOT NULL,
    "mimetype" VARCHAR(50) NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "ownerId" UUID,
    "category" VARCHAR(100) NOT NULL CHECK (category in ('ARTICLE_IMAGE')),
    "createdAt" timestamp DEFAULT NOW(),
    CONSTRAINT fk_owner_id FOREIGN KEY("ownerId") REFERENCES users("id") ON DELETE SET NULL,
    CONSTRAINT fk_article_id FOREIGN KEY("articleId") REFERENCES articles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "internalNotes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ownerId" UUID,
    "text" text NOT NULL,
    "articleId" UUID,
    "category" VARCHAR(50) NOT NULL CHECK ("category" in ('articles', 'activities')),
    "createdAt" timestamp DEFAULT NOW(),
    CONSTRAINT fk_owner_id FOREIGN KEY("ownerId") REFERENCES users("id") ON DELETE SET NULL,
    CONSTRAINT fk_article_id FOREIGN KEY("articleId") REFERENCES articles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "apiAudit" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "api" VARCHAR(50) NOT NULL,
    "userEmail" VARCHAR(50),
    "responseTime" DOUBLE PRECISION NOT NULL,
    "httpMethod" VARCHAR(20) NOT NULL CHECK ("httpMethod" in ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS')),
    "statusCode" INT NOT NULL,
    "createdAt" timestamp DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "activityLog" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "action" VARCHAR(50) NOT NULL,
    "resourceId" UUID,
    "userId" UUID,
    "userEmail" VARCHAR(50) NOT NULL,
    "createdAt" timestamp DEFAULT NOW(),
    "payload" json,
    CONSTRAINT fk_user_id FOREIGN KEY("userId") REFERENCES users("id") ON DELETE SET NULL
);