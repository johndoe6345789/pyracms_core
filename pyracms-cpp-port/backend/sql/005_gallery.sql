-- PyraCMS Gallery
-- Phase 5: Gallery albums, pictures, tags, and votes

CREATE TABLE IF NOT EXISTS gallery_albums (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    display_name VARCHAR(256) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    is_protected BOOLEAN NOT NULL DEFAULT FALSE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    default_picture_id INTEGER
);

CREATE INDEX IF NOT EXISTS idx_gallery_albums_tenant_id ON gallery_albums(tenant_id);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_user_id ON gallery_albums(user_id);

CREATE TABLE IF NOT EXISTS gallery_pictures (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(256) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_private BOOLEAN NOT NULL DEFAULT FALSE,
    album_id INTEGER REFERENCES gallery_albums(id) ON DELETE CASCADE,
    file_id INTEGER REFERENCES files(id) ON DELETE SET NULL,
    file_uuid VARCHAR(256),
    thread_id INTEGER NOT NULL DEFAULT -1,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_gallery_pictures_album_id ON gallery_pictures(album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_pictures_file_id ON gallery_pictures(file_id);
CREATE INDEX IF NOT EXISTS idx_gallery_pictures_user_id ON gallery_pictures(user_id);

-- Add FK constraint for default_picture_id now that gallery_pictures exists
ALTER TABLE gallery_albums
    ADD CONSTRAINT fk_gallery_albums_default_picture
    FOREIGN KEY (default_picture_id) REFERENCES gallery_pictures(id)
    ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS gallery_picture_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    picture_id INTEGER REFERENCES gallery_pictures(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gallery_picture_tags_picture_id ON gallery_picture_tags(picture_id);
CREATE INDEX IF NOT EXISTS idx_gallery_picture_tags_name ON gallery_picture_tags(name);

CREATE TABLE IF NOT EXISTS gallery_picture_votes (
    id SERIAL PRIMARY KEY,
    picture_id INTEGER REFERENCES gallery_pictures(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL,
    UNIQUE (picture_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_gallery_picture_votes_picture_id ON gallery_picture_votes(picture_id);
CREATE INDEX IF NOT EXISTS idx_gallery_picture_votes_user_id ON gallery_picture_votes(user_id);
