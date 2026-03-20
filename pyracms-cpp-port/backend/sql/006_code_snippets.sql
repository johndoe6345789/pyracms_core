-- PyraCMS Code Snippets
-- Phase 6: Code albums and code objects

CREATE TABLE IF NOT EXISTS code_albums (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    display_name VARCHAR(256) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_albums_tenant_id ON code_albums(tenant_id);

CREATE TABLE IF NOT EXISTS code_objects (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(256) NOT NULL DEFAULT '',
    code TEXT NOT NULL DEFAULT '',
    result TEXT NOT NULL DEFAULT '',
    needs_render BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    album_id INTEGER REFERENCES code_albums(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_code_objects_album_id ON code_objects(album_id);
