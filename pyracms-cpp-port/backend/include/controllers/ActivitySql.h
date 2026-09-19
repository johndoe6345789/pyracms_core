#pragma once

namespace pyracms {

// Public activity of one site ($1 = tenant, $2 = per-kind row cap). Only
// published, non-private articles; no email addresses; banned accounts
// are left out. A thread's opening post is not repeated as a "post".
constexpr const char *kActivitySql =
    "SELECT * FROM ("
    "(SELECT a.id, 'article'::text AS type, COALESCE(u.username, '') AS "
    "actor, COALESCE(NULLIF(a.display_name, ''), a.name) AS title, "
    "'/articles/' || a.name AS link, "
    "COALESCE(a.published_at, a.created_at) AS created_at "
    "FROM articles a LEFT JOIN users u ON u.id = a.user_id "
    "WHERE a.tenant_id = $1::int AND a.status = 'published' "
    "AND NOT a.is_private ORDER BY 6 DESC LIMIT $2::int) UNION ALL "
    "(SELECT t.id, 'thread'::text, COALESCE(u.username, ''), t.name, "
    "'/forum/thread/' || t.id, t.created_at "
    "FROM forum_threads t JOIN forums f ON f.id = t.forum_id "
    "JOIN forum_categories c ON c.id = f.category_id "
    "LEFT JOIN users u ON u.id = t.user_id WHERE c.tenant_id = $1::int "
    "ORDER BY 6 DESC LIMIT $2::int) UNION ALL "
    "(SELECT p.id, 'post'::text, COALESCE(u.username, ''), "
    "COALESCE(NULLIF(p.title, ''), t.name), "
    "'/forum/thread/' || t.id || '#post-' || p.id, p.created_at "
    "FROM forum_posts p JOIN forum_threads t ON t.id = p.thread_id "
    "JOIN forums f ON f.id = t.forum_id "
    "JOIN forum_categories c ON c.id = f.category_id "
    "LEFT JOIN users u ON u.id = p.user_id WHERE c.tenant_id = $1::int "
    "AND p.id <> (SELECT MIN(p0.id) FROM forum_posts p0 "
    "WHERE p0.thread_id = t.id) ORDER BY 6 DESC LIMIT $2::int) UNION ALL "
    "(SELECT m.id, 'comment'::text, u.username, a.name, "
    "'/articles/' || a.name, m.created_at "
    "FROM comments m JOIN users u ON u.id = m.user_id "
    "JOIN articles a ON a.id = m.content_id AND m.content_type = 'article' "
    "WHERE a.tenant_id = $1::int AND a.status = 'published' "
    "AND NOT a.is_private ORDER BY 6 DESC LIMIT $2::int) UNION ALL "
    "(SELECT u.id, 'user'::text, u.username, u.username, ''::text, "
    "u.created_at FROM users u WHERE u.tenant_id = $1::int "
    "AND NOT u.banned ORDER BY 6 DESC LIMIT $2::int)"
    ") x ORDER BY created_at DESC, type, id DESC LIMIT $2::int";

} // namespace pyracms
