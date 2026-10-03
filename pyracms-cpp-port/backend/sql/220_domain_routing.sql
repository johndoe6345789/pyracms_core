-- Multi-domain routing: map domains to tenants
-- One tenant can have multiple domains; one domain maps to one tenant.

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS primary_domain VARCHAR(256);

CREATE TABLE IF NOT EXISTS tenant_domains (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain VARCHAR(256) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_domains_domain ON tenant_domains(domain);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant_id ON tenant_domains(tenant_id);
