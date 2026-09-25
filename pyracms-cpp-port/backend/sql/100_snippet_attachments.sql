-- Files attached to a code snippet (e.g. the input data a "daily
-- programmer"-style challenge reads with open()). Reuses the existing
-- files table and its S3-backed storage; this is just the join.
CREATE TABLE IF NOT EXISTS snippet_attachments (
    id SERIAL PRIMARY KEY,
    snippet_id INTEGER NOT NULL
        REFERENCES code_snippets(id) ON DELETE CASCADE,
    file_id INTEGER NOT NULL
        REFERENCES files(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (snippet_id, file_id)
);
CREATE INDEX IF NOT EXISTS idx_snippet_attachments_snippet
    ON snippet_attachments(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_attachments_file
    ON snippet_attachments(file_id);
