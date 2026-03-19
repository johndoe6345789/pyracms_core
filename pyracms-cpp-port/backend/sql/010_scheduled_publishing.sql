-- Scheduled publishing support for articles
-- Adds status workflow: draft -> scheduled -> published, and unpublished

ALTER TABLE articles ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'published';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;

-- Set published_at for existing articles
UPDATE articles SET published_at = created_at WHERE published_at IS NULL;

-- Index for the scheduled publishing timer query
CREATE INDEX IF NOT EXISTS idx_articles_scheduled
    ON articles(tenant_id, status, scheduled_at)
    WHERE status = 'scheduled' AND scheduled_at IS NOT NULL;

-- Index for listing by status
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(tenant_id, status);
