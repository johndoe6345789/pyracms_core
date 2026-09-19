-- Security hardening. Idempotent: runs on every backend start.

-- Sessions: tokens issued before this instant are rejected. Set on every
-- password change/reset so old sessions die with the old password.
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_valid_after TIMESTAMPTZ;

-- Uploaded files get an owner and a site so that only the uploader (or an
-- administrator) can delete or list them.
ALTER TABLE files ADD COLUMN IF NOT EXISTS user_id INTEGER
    REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE files ADD COLUMN IF NOT EXISTS tenant_id INTEGER
    REFERENCES tenants(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_files_owner ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_tenant ON files(tenant_id);

-- Expired or spent reset/verification tokens carry no value.
DELETE FROM password_reset_tokens
    WHERE used = TRUE OR expires_at < NOW() - INTERVAL '1 day';
DELETE FROM email_verification_tokens
    WHERE used = TRUE OR expires_at < NOW() - INTERVAL '1 day';

-- First-account-owns-the-scope must be race free: at most one account per
-- scope (tenant, or NULL = platform) may be marked as the founding one, so
-- two simultaneous first registrations cannot both become owner.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_first BOOLEAN
    NOT NULL DEFAULT FALSE;
UPDATE users SET is_first = TRUE
    WHERE id IN (SELECT MIN(id) FROM users GROUP BY COALESCE(tenant_id, 0))
      AND NOT is_first;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_scope_first
    ON users (COALESCE(tenant_id, 0)) WHERE is_first;
