-- Which storage backend holds a file's bytes ('local' disk or 's3'), so
-- files written before STORAGE_BACKEND was switched stay readable.
-- Idempotent: runs on every backend start.
ALTER TABLE files ADD COLUMN IF NOT EXISTS storage VARCHAR(16)
    NOT NULL DEFAULT 'local';
