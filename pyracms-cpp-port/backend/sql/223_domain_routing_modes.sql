-- Domain routing mode configuration
-- Allows switching between multi-domain and single-domain (budget-friendly) modes

CREATE TABLE IF NOT EXISTS platform_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(128) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialize platform settings
INSERT INTO platform_settings (key, value, description)
VALUES (
    'domain_routing_mode',
    'multi-domain',
    'multi-domain: each domain maps to one site | single-domain: one domain shows all sites'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings (key, value, description)
VALUES (
    'single_domain_primary_site',
    'pyracms',
    'In single-domain mode: which site (slug) to show on / (leave empty for splash screen)'
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings (key, value, description)
VALUES (
    'single_domain_root_shows_splash',
    'false',
    'In single-domain mode: if true, / shows splash screen (all sites); if false, / shows primary_site'
)
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);
