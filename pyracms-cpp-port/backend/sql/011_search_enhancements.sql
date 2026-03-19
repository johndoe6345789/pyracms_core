-- Search enhancements: trigram indexes for autocomplete

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram indexes for prefix/fuzzy matching (autocomplete)
CREATE INDEX IF NOT EXISTS idx_articles_name_trgm
    ON articles USING GIN(name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_articles_display_name_trgm
    ON articles USING GIN(display_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_forum_posts_title_trgm
    ON forum_posts USING GIN(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_gamedep_display_name_trgm
    ON gamedep_pages USING GIN(display_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_snippets_title_trgm
    ON code_snippets USING GIN(title gin_trgm_ops);
