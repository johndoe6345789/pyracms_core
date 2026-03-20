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

CREATE TABLE IF NOT EXISTS menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    route_path VARCHAR(256) NOT NULL DEFAULT '',
    url VARCHAR(512) NOT NULL DEFAULT '',
    type VARCHAR(16) NOT NULL DEFAULT 'route' CHECK (type IN ('route', 'url')),
    group_id INTEGER REFERENCES menu_groups(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    permissions VARCHAR(256) NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_menus_group_id ON menus(group_id);
CREATE INDEX IF NOT EXISTS idx_menus_position ON menus(position);
