-- PyraCMS Initial Schema
-- Phase 1: Core tables (users, groups, tenants)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL DEFAULT '',
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    website VARCHAR(256) DEFAULT '',
    birthday DATE,
    sex VARCHAR(16),
    aboutme TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    banned BOOLEAN NOT NULL DEFAULT FALSE,
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    post_count INTEGER NOT NULL DEFAULT 0,
    signature TEXT DEFAULT '',
    api_uuid VARCHAR(128) UNIQUE DEFAULT gen_random_uuid()::text
);

CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_groups (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);

CREATE TABLE IF NOT EXISTS tenants (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    description TEXT DEFAULT '',
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_members (
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL DEFAULT 'member',
    PRIMARY KEY (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    value TEXT DEFAULT '',
    UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(128) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    purpose VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Default groups
INSERT INTO groups (name, display_name) VALUES
    ('admin', 'Administrators'),
    ('everyone', 'Everyone'),
    ('authenticated', 'Authenticated Users'),
    ('article', 'Article Authors'),
    ('forum', 'Forum Users'),
    ('forum_moderator', 'Forum Moderators'),
    ('gallery', 'Gallery Users'),
    ('gamedep', 'Game/Dep Publishers')
ON CONFLICT (name) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_api_uuid ON users(api_uuid);
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_settings_tenant_name ON settings(tenant_id, name);
CREATE INDEX IF NOT EXISTS idx_tokens_uuid ON tokens(uuid);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON tokens(expires_at);
