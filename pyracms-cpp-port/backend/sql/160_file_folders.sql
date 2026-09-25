-- Folders in the admin file manager: a file lives in one folder ('' = the
-- top), written as a path like "photos/2024". Empty folders that were made
-- on purpose are kept in file_folders.
ALTER TABLE files ADD COLUMN IF NOT EXISTS folder VARCHAR(512)
    NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(tenant_id, folder);
CREATE TABLE IF NOT EXISTS file_folders (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    path VARCHAR(512) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, path)
);
