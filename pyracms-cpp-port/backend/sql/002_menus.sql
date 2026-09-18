-- PyraCMS Menu System & Files
-- Phase 2: Files table and menu system

CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(256) NOT NULL,
    uuid VARCHAR(128) UNIQUE NOT NULL,
    mimetype VARCHAR(128) NOT NULL DEFAULT '',
    size BIGINT NOT NULL DEFAULT 0,
    is_picture BOOLEAN NOT NULL DEFAULT FALSE,
    is_video BOOLEAN NOT NULL DEFAULT FALSE,
    download_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_files_uuid ON files(uuid);

CREATE TABLE IF NOT EXISTS menu_groups (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    UNIQUE (tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_menu_groups_tenant_id ON menu_groups(tenant_id);

-- Older databases created this table as "menus"; the code uses menu_items.
DO $$
BEGIN
    IF to_regclass('public.menu_items') IS NULL
       AND to_regclass('public.menus') IS NOT NULL THEN
        ALTER TABLE menus RENAME TO menu_items;
    END IF;
END $$;

DROP INDEX IF EXISTS idx_menus_group_id;
DROP INDEX IF EXISTS idx_menus_position;

CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    route_path VARCHAR(256) NOT NULL DEFAULT '',
    url VARCHAR(512) NOT NULL DEFAULT '',
    type VARCHAR(16) NOT NULL DEFAULT 'route'
        CHECK (type IN ('route', 'url')),
    group_id INTEGER REFERENCES menu_groups(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    permissions VARCHAR(256) NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_menu_items_group_id ON menu_items(group_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_position ON menu_items(position);
