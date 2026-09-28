-- Videos: a site's video library (YouTube style). The video and its
-- poster image are uploaded files; comments use the shared comments
-- table (content_type 'video'). Idempotent: runs on every backend start.
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    file_uuid VARCHAR(128) NOT NULL,
    thumbnail_uuid VARCHAR(128) NOT NULL DEFAULT '',
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    view_count BIGINT NOT NULL DEFAULT 0,
    visibility VARCHAR(16) NOT NULL DEFAULT 'public',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE videos DROP CONSTRAINT IF EXISTS videos_visibility_check;
ALTER TABLE videos ADD CONSTRAINT videos_visibility_check
    CHECK (visibility IN ('public', 'unlisted', 'private'));
CREATE INDEX IF NOT EXISTS idx_videos_tenant_created
    ON videos (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_user ON videos (user_id);

CREATE TABLE IF NOT EXISTS video_votes (
    video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    PRIMARY KEY (video_id, user_id)
);
