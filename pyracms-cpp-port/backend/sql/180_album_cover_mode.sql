-- An album's cover is either the picture chosen for it ('chosen', the
-- default) or a different picture of the album on every visit ('random').
ALTER TABLE gallery_albums ADD COLUMN IF NOT EXISTS cover_mode VARCHAR(8)
    NOT NULL DEFAULT 'chosen';
