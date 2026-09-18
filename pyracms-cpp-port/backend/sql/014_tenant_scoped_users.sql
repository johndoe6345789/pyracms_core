-- Tenant-scoped accounts.
-- users.tenant_id NULL  = platform account (portal sign-in, site owners,
--                          super-admins).
-- users.tenant_id = N   = account that exists only inside tenant N, so
--                          "richard" on tenant A is a different person to
--                          "richard" on tenant B.
-- Idempotent: this runs on every backend start.
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INTEGER
    REFERENCES tenants(id) ON DELETE CASCADE;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- COALESCE so that platform accounts (NULL) are still unique among
-- themselves; NULLs are otherwise distinct in a unique index.
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_scope_username
    ON users (COALESCE(tenant_id, 0), username);
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_scope_email
    ON users (COALESCE(tenant_id, 0), email);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
