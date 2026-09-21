-- Chunked (multipart) uploads in flight. One row per upload, one per
-- received part; state_hex is the running sha256 after that part so a
-- retried last part can be re-hashed. Rows expire after 24 h (swept by
-- the backend). Idempotent: runs on every backend start.
CREATE TABLE IF NOT EXISTS file_uploads (
    id VARCHAR(64) PRIMARY KEY,
    s3_upload_id VARCHAR(256) NOT NULL,
    file_uuid VARCHAR(64) NOT NULL,
    user_id INTEGER NOT NULL,
    tenant_id INTEGER NOT NULL DEFAULT 0,
    filename VARCHAR(255) NOT NULL,
    mimetype VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    expected_sha256 VARCHAR(64) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created
    ON file_uploads (created_at);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user
    ON file_uploads (user_id);
CREATE TABLE IF NOT EXISTS file_upload_parts (
    upload_id VARCHAR(64) NOT NULL
        REFERENCES file_uploads(id) ON DELETE CASCADE,
    part_no INTEGER NOT NULL,
    size BIGINT NOT NULL,
    etag VARCHAR(128) NOT NULL,
    state_hex TEXT NOT NULL,
    PRIMARY KEY (upload_id, part_no)
);
