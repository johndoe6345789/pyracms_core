-- Snippet history, like article_revisions: every saved state of a snippet's
-- title/code/language, oldest first. code_snippets stays the current state;
-- this is the append-only record of how it got there. Revisions are
-- numbered per snippet (1, 2, 3...) by row_number() at read time, so there
-- is nothing to keep in step. Idempotent: runs on every backend start.
CREATE TABLE IF NOT EXISTS snippet_revisions (
    id SERIAL PRIMARY KEY,
    snippet_id INTEGER NOT NULL
        REFERENCES code_snippets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    summary VARCHAR(512) NOT NULL DEFAULT '',
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snippet_revisions_snippet
    ON snippet_revisions(snippet_id, id);

-- Snippets that predate revisions get one holding their current state.
INSERT INTO snippet_revisions
    (snippet_id, title, code, language, summary, user_id, created_at)
SELECT s.id, s.title, s.code, s.language, 'Initial revision', s.author_id,
       s.created_at
FROM code_snippets s
WHERE NOT EXISTS (SELECT 1 FROM snippet_revisions r WHERE r.snippet_id = s.id);
