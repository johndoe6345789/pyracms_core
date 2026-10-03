-- Configure display modes for each domain
-- pynguins.xyz and josheeb.net: single-site mode (only show their own site)
-- pyracms.wardcrew.com: multi-site mode (show all sites on /)

UPDATE tenant_domains
SET display_mode = 'single',
    display_mode_description = 'Single-site mode: only shows PyNguins content'
WHERE domain = 'pynguins.xyz';

UPDATE tenant_domains
SET display_mode = 'single',
    display_mode_description = 'Single-site mode: only shows Josheeb content'
WHERE domain = 'josheeb.net';

UPDATE tenant_domains
SET display_mode = 'multi',
    display_mode_description = 'Multi-site mode: shows all available sites (splash screen on /)'
WHERE domain = 'pyracms.wardcrew.com';
