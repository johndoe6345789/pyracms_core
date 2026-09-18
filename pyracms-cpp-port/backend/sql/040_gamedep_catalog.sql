-- Game/dep catalog: tenant scope, string versions, binary metadata,
-- typed dependencies (pip|pyracms) and screenshots. Idempotent.
ALTER TABLE files ADD COLUMN IF NOT EXISTS sha256 VARCHAR(64)
    NOT NULL DEFAULT '';

ALTER TABLE gamedep_pages ADD COLUMN IF NOT EXISTS tenant_id INTEGER
    REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE gamedep_pages DROP CONSTRAINT IF EXISTS gamedep_pages_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamedep_pages_scope_name
    ON gamedep_pages (COALESCE(tenant_id, 0), name);
CREATE INDEX IF NOT EXISTS idx_gamedep_pages_tenant
    ON gamedep_pages(tenant_id);

-- "1.0.0" is not a DECIMAL: versions are free-form strings.
ALTER TABLE gamedep_revisions ALTER COLUMN version DROP DEFAULT;
ALTER TABLE gamedep_revisions
    ALTER COLUMN version TYPE VARCHAR(64) USING version::text;
ALTER TABLE gamedep_revisions ALTER COLUMN version SET DEFAULT '0';
ALTER TABLE gamedep_revisions ADD COLUMN IF NOT EXISTS executable
    VARCHAR(256) NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamedep_revisions_page_version
    ON gamedep_revisions (page_id, version);

ALTER TABLE gamedep_binaries ADD COLUMN IF NOT EXISTS sha256
    VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE gamedep_binaries ADD COLUMN IF NOT EXISTS executable
    VARCHAR(256) NOT NULL DEFAULT '';
DELETE FROM gamedep_binaries a USING gamedep_binaries b
    WHERE a.id > b.id AND a.revision_id = b.revision_id
      AND a.os_id = b.os_id AND a.arch_id = b.arch_id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamedep_binaries_target
    ON gamedep_binaries (revision_id, os_id, arch_id);

ALTER TABLE gamedep_dependencies ADD COLUMN IF NOT EXISTS kind
    VARCHAR(16) NOT NULL DEFAULT 'pyracms';
ALTER TABLE gamedep_dependencies ADD COLUMN IF NOT EXISTS name
    VARCHAR(256) NOT NULL DEFAULT '';
ALTER TABLE gamedep_dependencies ADD COLUMN IF NOT EXISTS version
    VARCHAR(128) NOT NULL DEFAULT '';
ALTER TABLE gamedep_dependencies DROP CONSTRAINT IF EXISTS chk_gd_dep_kind;
ALTER TABLE gamedep_dependencies ADD CONSTRAINT chk_gd_dep_kind
    CHECK (kind IN ('pip', 'pyracms'));
UPDATE gamedep_dependencies d SET name = p.name, version = r.version
    FROM gamedep_revisions r JOIN gamedep_pages p ON p.id = r.page_id
    WHERE r.id = d.dep_revision_id AND d.name = '';
DELETE FROM gamedep_dependencies a USING gamedep_dependencies b
    WHERE a.id > b.id AND a.game_id = b.game_id AND a.kind = b.kind
      AND a.name = b.name AND a.version = b.version;
CREATE UNIQUE INDEX IF NOT EXISTS uq_gamedep_dependencies_item
    ON gamedep_dependencies (game_id, kind, name, version);

CREATE TABLE IF NOT EXISTS gamedep_screenshots (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL REFERENCES gamedep_pages(id)
        ON DELETE CASCADE,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 0,
    UNIQUE (page_id, file_id)
);
CREATE INDEX IF NOT EXISTS idx_gamedep_screenshots_page
    ON gamedep_screenshots(page_id);

-- Module types are free-form (python, native, python-package...).
ALTER TABLE gamedep_revisions
    DROP CONSTRAINT IF EXISTS gamedep_revisions_module_type_check;
ALTER TABLE gamedep_revisions ALTER COLUMN module_type TYPE VARCHAR(32);
