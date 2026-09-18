-- The first account of each scope owns it (SuperAdmin on the platform,
-- SiteAdmin inside a tenant). Registration does this for new accounts;
-- this backfills scopes that predate role enforcement. Idempotent: only
-- acts on scopes that have no admin yet.
UPDATE users u SET role = CASE WHEN u.tenant_id IS NULL THEN 4 ELSE 3 END
WHERE u.id IN (
    SELECT MIN(id) FROM users GROUP BY COALESCE(tenant_id, 0)
)
AND NOT EXISTS (
    SELECT 1 FROM users a
    WHERE COALESCE(a.tenant_id, 0) = COALESCE(u.tenant_id, 0)
      AND a.role >= 3
);
