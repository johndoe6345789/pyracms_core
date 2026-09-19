#pragma once

namespace pyracms {

// $1 user, $2 site. Counts only that site's forum content. A site's own
// account is always visible; a platform account only once it has posted
// there. Reputation = posts + 2 per thread + 5 per like received.
constexpr const char *kUserStatsSql =
    "WITH posts AS (SELECT p.id FROM forum_posts p "
    "JOIN forum_threads t ON t.id = p.thread_id "
    "JOIN forums f ON f.id = t.forum_id "
    "JOIN forum_categories c ON c.id = f.category_id "
    "WHERE p.user_id = $1::int AND c.tenant_id = $2::int), "
    "threads AS (SELECT t.id FROM forum_threads t "
    "JOIN forums f ON f.id = t.forum_id "
    "JOIN forum_categories c ON c.id = f.category_id "
    "WHERE t.user_id = $1::int AND c.tenant_id = $2::int), "
    "likes AS (SELECT COUNT(*)::int AS n FROM forum_post_votes v "
    "WHERE v.is_like AND v.post_id IN (SELECT id FROM posts)) "
    "SELECT u.created_at, (SELECT COUNT(*) FROM posts)::int AS post_count, "
    "(SELECT COUNT(*) FROM threads)::int AS thread_count, "
    "(SELECT n FROM likes) AS like_count FROM users u "
    "WHERE u.id = $1::int AND (u.tenant_id = $2::int OR "
    "(u.tenant_id IS NULL AND (EXISTS (SELECT 1 FROM posts) OR "
    "EXISTS (SELECT 1 FROM threads))))";

} // namespace pyracms
