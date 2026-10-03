-- Per-domain display mode configuration
-- Each domain can independently show single site or multi-site splash

ALTER TABLE tenant_domains ADD COLUMN IF NOT EXISTS display_mode VARCHAR(32) NOT NULL DEFAULT 'single';
ALTER TABLE tenant_domains ADD COLUMN IF NOT EXISTS display_mode_description TEXT;

-- display_mode values:
--   'single': This domain shows ONLY its bound site on /
--   'multi': This domain shows ALL sites (splash screen on /)

-- Examples:
--   pynguins.xyz: display_mode='single' → / shows PyNguins content
--   josheeb.net: display_mode='single' → / shows Josheeb content
--   pyracms.wardcrew.com: display_mode='multi' → / shows splash with all sites

CREATE INDEX IF NOT EXISTS idx_tenant_domains_display_mode ON tenant_domains(display_mode);

-- Update existing domains to have single display mode
UPDATE tenant_domains SET display_mode = 'single' WHERE display_mode IS NULL;
