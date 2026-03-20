-- PyraCMS Hypernucleus
-- Phase 7: Operating systems, architectures, game/dep pages, revisions, binaries, dependencies, tags, votes

CREATE TABLE IF NOT EXISTS operating_systems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) UNIQUE NOT NULL
);

INSERT INTO operating_systems (name, display_name) VALUES
    ('pi', 'Platform Independent'),
    ('win', 'Windows'),
    ('mac', 'macOS'),
    ('lin', 'Linux'),
    ('sol', 'Solaris'),
    ('fbsd', 'FreeBSD'),
    ('nbsd', 'NetBSD'),
    ('obsd', 'OpenBSD')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS architectures (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    display_name VARCHAR(128) UNIQUE NOT NULL
);

INSERT INTO architectures (name, display_name) VALUES
    ('pi', 'Platform Independent'),
    ('i386', '32-bit x86'),
    ('x86_64', '64-bit x86'),
    ('arm', 'ARM LE'),
    ('armeb', 'ARM BE'),
    ('ppc', '32-bit PowerPC'),
    ('ppc64', '64-bit PowerPC'),
    ('sparc', '32-bit SPARC'),
    ('sparc64', '64-bit SPARC')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS gamedep_pages (
    id SERIAL PRIMARY KEY,
    type VARCHAR(16) NOT NULL CHECK (type IN ('game', 'dep')),
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(256) UNIQUE NOT NULL,
    display_name VARCHAR(256) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    thread_id INTEGER NOT NULL DEFAULT -1,
    album_id INTEGER NOT NULL DEFAULT -1,
    view_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_gamedep_pages_owner_id ON gamedep_pages(owner_id);
CREATE INDEX IF NOT EXISTS idx_gamedep_pages_type ON gamedep_pages(type);
CREATE INDEX IF NOT EXISTS idx_gamedep_pages_name ON gamedep_pages(name);

CREATE TABLE IF NOT EXISTS gamedep_revisions (
    id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES gamedep_pages(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES files(id) ON DELETE SET NULL,
    module_type VARCHAR(16) NOT NULL CHECK (module_type IN ('file', 'folder')),
    version DECIMAL NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_gamedep_revisions_page_id ON gamedep_revisions(page_id);
CREATE INDEX IF NOT EXISTS idx_gamedep_revisions_file_id ON gamedep_revisions(file_id);

CREATE TABLE IF NOT EXISTS gamedep_binaries (
    id SERIAL PRIMARY KEY,
    revision_id INTEGER REFERENCES gamedep_revisions(id) ON DELETE CASCADE,
    os_id INTEGER REFERENCES operating_systems(id) ON DELETE CASCADE,
    arch_id INTEGER REFERENCES architectures(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES files(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_gamedep_binaries_revision_id ON gamedep_binaries(revision_id);
CREATE INDEX IF NOT EXISTS idx_gamedep_binaries_os_id ON gamedep_binaries(os_id);
CREATE INDEX IF NOT EXISTS idx_gamedep_binaries_arch_id ON gamedep_binaries(arch_id);
CREATE INDEX IF NOT EXISTS idx_gamedep_binaries_file_id ON gamedep_binaries(file_id);

CREATE TABLE IF NOT EXISTS gamedep_dependencies (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES gamedep_pages(id) ON DELETE CASCADE,
    dep_revision_id INTEGER REFERENCES gamedep_revisions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gamedep_dependencies_game_id ON gamedep_dependencies(game_id);
CREATE INDEX IF NOT EXISTS idx_gamedep_dependencies_dep_revision_id ON gamedep_dependencies(dep_revision_id);

CREATE TABLE IF NOT EXISTS gamedep_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    page_id INTEGER REFERENCES gamedep_pages(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gamedep_tags_page_id ON gamedep_tags(page_id);
CREATE INDEX IF NOT EXISTS idx_gamedep_tags_name ON gamedep_tags(name);

CREATE TABLE IF NOT EXISTS gamedep_votes (
    id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES gamedep_pages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    UNIQUE (page_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_gamedep_votes_page_id ON gamedep_votes(page_id);
CREATE INDEX IF NOT EXISTS idx_gamedep_votes_user_id ON gamedep_votes(user_id);
