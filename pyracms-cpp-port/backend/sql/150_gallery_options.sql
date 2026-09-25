-- How an album lists its pictures: newest (default), oldest or by title.
ALTER TABLE gallery_albums
    ADD COLUMN IF NOT EXISTS sort_order VARCHAR(16) NOT NULL DEFAULT 'newest';
