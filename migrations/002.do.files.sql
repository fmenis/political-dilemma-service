CREATE TABLE IF NOT EXISTS files (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "articleId" UUID,
    "fullPath" VARCHAR(200) NOT NULL,
    "url" VARCHAR(200) UNIQUE NOT NULL,
    "fileName" VARCHAR(50) UNIQUE NOT NULL,
    "extension" VARCHAR(10) NOT NULL,
    "mimetype" VARCHAR(50) NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "ownerId" INT,
    "category" VARCHAR(100) NOT NULL CHECK (category in ('ARTICLE_IMAGE')),
    "createdAt" timestamp DEFAULT NOW(),
    CONSTRAINT fk_owner_id FOREIGN KEY("ownerId") REFERENCES users("id") ON DELETE SET NULL,
    CONSTRAINT fk_article_id FOREIGN KEY("articleId") REFERENCES articles(id) ON DELETE CASCADE
);