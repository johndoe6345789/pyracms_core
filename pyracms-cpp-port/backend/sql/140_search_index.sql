-- Search indexing. search_documents is the one place that decides what is
-- searchable (public, published content only) and how each thing becomes a
-- document. Triggers note every change in search_outbox; the API drains it
-- into Elasticsearch (or discards it when there is none). A full reindex is
-- just "queue every document".
CREATE TABLE IF NOT EXISTS search_outbox (
    id BIGSERIAL PRIMARY KEY,
    doc_type TEXT NOT NULL,
    doc_id INTEGER NOT NULL,
    queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE VIEW search_documents AS
SELECT 'article'::text AS doc_type, a.id AS doc_id, a.tenant_id,
       a.display_name AS title,
       COALESCE((SELECT r.content FROM article_revisions r
                 WHERE r.article_id = a.id
                 ORDER BY r.id DESC LIMIT 1), '') AS body,
       COALESCE((SELECT string_agg(t.name, ' ') FROM article_tags t
                 WHERE t.article_id = a.id), '') AS tags,
       COALESCE(u.username, '') AS author,
       '/articles/' || a.name AS url, a.created_at
FROM articles a LEFT JOIN users u ON u.id = a.user_id
WHERE NOT a.is_private AND a.status = 'published'
UNION ALL
SELECT 'snippet', s.id, s.tenant_id, s.title, s.code,
       COALESCE((SELECT string_agg(t.name, ' ') FROM snippet_tags t
                 WHERE t.snippet_id = s.id), ''),
       COALESCE(u.username, ''), '/snippets/' || s.id, s.created_at
FROM code_snippets s LEFT JOIN users u ON u.id = s.author_id
WHERE s.visibility = 'public'
UNION ALL
SELECT 'forum_post', p.id, c.tenant_id, COALESCE(p.title, ''),
       COALESCE(p.content, ''), '', COALESCE(u.username, ''),
       '/forum/thread/' || p.thread_id, p.created_at
FROM forum_posts p
JOIN forum_threads t ON t.id = p.thread_id
JOIN forums f ON f.id = t.forum_id
JOIN forum_categories c ON c.id = f.category_id
LEFT JOIN users u ON u.id = p.user_id
UNION ALL
SELECT 'gamedep', g.id, g.tenant_id, COALESCE(g.display_name, g.name),
       COALESCE(g.description, ''), '', '', '/gamedep/' || g.name,
       g.created_at
FROM gamedep_pages g
WHERE NOT g.is_private AND EXISTS (SELECT 1 FROM gamedep_revisions gr
      WHERE gr.page_id = g.id AND gr.published);

CREATE OR REPLACE FUNCTION search_enqueue() RETURNS trigger AS $$
DECLARE ref TEXT;
BEGIN
    IF TG_OP = 'DELETE' THEN
        ref := to_jsonb(OLD) ->> TG_ARGV[1];
    ELSE
        ref := to_jsonb(NEW) ->> TG_ARGV[1];
    END IF;
    IF ref IS NOT NULL THEN
        INSERT INTO search_outbox (doc_type, doc_id)
        VALUES (TG_ARGV[0], ref::int);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t RECORD;
BEGIN
    FOR t IN SELECT * FROM (VALUES
        ('articles', 'article', 'id'),
        ('article_revisions', 'article', 'article_id'),
        ('article_tags', 'article', 'article_id'),
        ('code_snippets', 'snippet', 'id'),
        ('snippet_tags', 'snippet', 'snippet_id'),
        ('forum_posts', 'forum_post', 'id'),
        ('gamedep_pages', 'gamedep', 'id'),
        ('gamedep_revisions', 'gamedep', 'page_id')
    ) v(tbl, kind, col) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS search_outbox_%s ON %I',
                       t.tbl, t.tbl);
        EXECUTE format('CREATE TRIGGER search_outbox_%s AFTER INSERT OR '
                       'UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE '
                       'FUNCTION search_enqueue(%L, %L)',
                       t.tbl, t.tbl, t.kind, t.col);
    END LOOP;
END $$;
