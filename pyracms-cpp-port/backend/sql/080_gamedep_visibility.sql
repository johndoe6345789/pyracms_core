-- Game/dep visibility: a page is PUBLIC when it is not private and has a
-- published revision (launchers may then browse and download it without
-- signing in). is_private hides a page from everyone but its owner and
-- admins. Existing pages stay public. Idempotent.
ALTER TABLE gamedep_pages ADD COLUMN IF NOT EXISTS is_private BOOLEAN
    NOT NULL DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_gamedep_pages_private
    ON gamedep_pages(is_private);
