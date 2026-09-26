-- Who may fetch a file: 'public' (anyone with the link, as before) or
-- 'authenticated' (only signed-in users of the file's site).
ALTER TABLE files ADD COLUMN IF NOT EXISTS visibility VARCHAR(16)
    NOT NULL DEFAULT 'public';
ALTER TABLE files DROP CONSTRAINT IF EXISTS files_visibility_check;
ALTER TABLE files ADD CONSTRAINT files_visibility_check
    CHECK (visibility IN ('public', 'authenticated'));
