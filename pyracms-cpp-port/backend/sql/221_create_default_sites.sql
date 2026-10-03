-- Create the three default multi-domain sites and map domains

-- PyRACMS official site (pyracms.wardcrew.com)
INSERT INTO tenants (slug, display_name, description, primary_domain)
VALUES ('pyracms', 'PyRACMS', 'PyRACMS official site', 'pyracms.wardcrew.com')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tenant_domains (tenant_id, domain)
SELECT id, 'pyracms.wardcrew.com' FROM tenants WHERE slug = 'pyracms'
ON CONFLICT (domain) DO NOTHING;

-- Pynguins site (pynguins.xyz)
INSERT INTO tenants (slug, display_name, description, primary_domain)
VALUES ('pynguins', 'PyNguins', 'PyRACMS Demo Site', 'pynguins.xyz')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tenant_domains (tenant_id, domain)
SELECT id, 'pynguins.xyz' FROM tenants WHERE slug = 'pynguins'
ON CONFLICT (domain) DO NOTHING;

-- Josheeb site (josheeb.net)
INSERT INTO tenants (slug, display_name, description, primary_domain)
VALUES ('josheeb', 'Josheeb', 'Josheeb Personal Site', 'josheeb.net')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tenant_domains (tenant_id, domain)
SELECT id, 'josheeb.net' FROM tenants WHERE slug = 'josheeb'
ON CONFLICT (domain) DO NOTHING;
