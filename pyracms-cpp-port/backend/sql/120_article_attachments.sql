-- Files attached to an article: the downloads that go with it (data sets,
-- source archives, the documents a legacy page linked to). Reuses the
-- files table and its S3-backed storage; this is just the join.
CREATE TABLE IF NOT EXISTS article_attachments (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL
        REFERENCES articles(id) ON DELETE CASCADE,
    file_id INTEGER NOT NULL
        REFERENCES files(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, file_id)
);
CREATE INDEX IF NOT EXISTS idx_article_attachments_article
    ON article_attachments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_attachments_file
    ON article_attachments(file_id);
