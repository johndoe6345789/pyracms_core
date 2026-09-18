-- Forum thread moderation flags (pinned / locked). Idempotent.
ALTER TABLE forum_threads
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE forum_threads
    ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_forum_threads_pinned
    ON forum_threads(forum_id, is_pinned);
