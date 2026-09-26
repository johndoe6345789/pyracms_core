-- Better search: what gets indexed is readable text (no markup, links or
-- file ids), and photo albums and pictures become searchable too.

-- Prose without its markup: HTML tags, reStructuredText directives, links,
-- image references, heading underlines and Markdown punctuation.
CREATE OR REPLACE FUNCTION search_plain(t text) RETURNS text
LANGUAGE sql IMMUTABLE AS $f$
SELECT btrim(regexp_replace(regexp_replace(regexp_replace(regexp_replace(
       regexp_replace(regexp_replace(regexp_replace(regexp_replace(
       regexp_replace(regexp_replace(
         COALESCE(t, ''),
         '\r', '', 'g'),
         '(^|\n)[ \t]*\.\. [A-Za-z:-]+::[^\n]*', ' ', 'g'),
         '(^|\n)[ \t]*:(alt|width|height|scale|align):[^\n]*', ' ', 'g'),
         '<[^>]*>', ' ', 'g'),
         '!?\[([^\]]*)\]\([^)]*\)', '\1', 'g'),
         '`([^`<]*)<[^>]*>`_+', '\1', 'g'),
         '(https?://|/api/files/)[^\s)>"'']+', ' ', 'g'),
         '(^|\n)[-=~#*^"+]{3,}[ \t]*(\n|$)', E'\n', 'g'),
         '[*_`#>|]+|&[a-z]+;|[-=~^+]{3,}', ' ', 'g'),
         '\s+', ' ', 'g'))
$f$;

CREATE OR REPLACE VIEW search_documents AS
SELECT 'article'::text AS doc_type, a.id AS doc_id, a.tenant_id,
       a.display_name AS title,
       search_plain(COALESCE((SELECT r.content FROM article_revisions r
                 WHERE r.article_id = a.id
                 ORDER BY r.id DESC LIMIT 1), '')) AS body,
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
       search_plain(COALESCE(p.content, '')), '', COALESCE(u.username, ''),
       '/forum/thread/' || p.thread_id, p.created_at
FROM forum_posts p
JOIN forum_threads t ON t.id = p.thread_id
JOIN forums f ON f.id = t.forum_id
JOIN forum_categories c ON c.id = f.category_id
LEFT JOIN users u ON u.id = p.user_id
UNION ALL
SELECT 'gamedep', g.id, g.tenant_id, COALESCE(g.display_name, g.name),
       search_plain(COALESCE(g.description, '')), '', '',
       '/gamedep/' || g.name, g.created_at
FROM gamedep_pages g
WHERE NOT g.is_private AND EXISTS (SELECT 1 FROM gamedep_revisions gr
      WHERE gr.page_id = g.id AND gr.published)
UNION ALL
SELECT 'album', al.id, al.tenant_id, al.display_name,
       search_plain(al.description), '', COALESCE(u.username, ''),
       '/gallery/' || al.id, al.created_at
FROM gallery_albums al LEFT JOIN users u ON u.id = al.user_id
WHERE NOT al.is_private AND al.tenant_id IS NOT NULL
UNION ALL
SELECT 'picture', pi.id, al.tenant_id, pi.display_name,
       search_plain(pi.description), '', COALESCE(u.username, ''),
       '/gallery/picture/' || pi.id, pi.created_at
FROM gallery_pictures pi JOIN gallery_albums al ON al.id = pi.album_id
LEFT JOIN users u ON u.id = pi.user_id
WHERE NOT pi.is_private AND NOT al.is_private AND al.tenant_id IS NOT NULL;

DO $$
DECLARE t RECORD;
BEGIN
    FOR t IN SELECT * FROM (VALUES
        ('gallery_albums', 'album', 'id'),
        ('gallery_pictures', 'picture', 'id')
    ) v(tbl, kind, col) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS search_outbox_%s ON %I',
                       t.tbl, t.tbl);
        EXECUTE format('CREATE TRIGGER search_outbox_%s AFTER INSERT OR '
                       'UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE '
                       'FUNCTION search_enqueue(%L, %L)',
                       t.tbl, t.tbl, t.kind, t.col);
    END LOOP;
END $$;

-- The index holds the old markup-laden text: index everything again, once.
CREATE TABLE IF NOT EXISTS search_flags (name TEXT PRIMARY KEY);
WITH first AS (
    INSERT INTO search_flags (name) VALUES ('210-reindex-2')
    ON CONFLICT DO NOTHING RETURNING 1)
INSERT INTO search_outbox (doc_type, doc_id)
SELECT doc_type, doc_id FROM search_documents
WHERE EXISTS (SELECT 1 FROM first);
