-- Tags on code snippets, same idea as article_tags: free-form labels a
-- site's tag cloud counts. One row per (snippet, tag), case-insensitive.
CREATE TABLE IF NOT EXISTS snippet_tags (
    id SERIAL PRIMARY KEY,
    snippet_id INTEGER NOT NULL
        REFERENCES code_snippets(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_snippet_tags_unique
    ON snippet_tags(snippet_id, lower(name));
CREATE INDEX IF NOT EXISTS idx_snippet_tags_name
    ON snippet_tags(lower(name));

-- Early imports stored blank tag names; they only pollute tag clouds.
DELETE FROM article_tags WHERE btrim(name) = '';
