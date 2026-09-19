#pragma once

#include "services/ForumService.h"

namespace pyracms {

namespace {
const char *kThreadCols =
    "t.id, t.name, t.description, t.forum_id, "
    "COALESCE(t.view_count, 0) AS view_count, "
    "COALESCE(t.total_posts, 0) AS total_posts, "
    "t.created_at, COALESCE(t.user_id, 0) AS user_id, "
    "COALESCE(u.username, (SELECT u2.username FROM forum_posts p2 "
    "JOIN users u2 ON u2.id = p2.user_id WHERE p2.thread_id = t.id "
    "ORDER BY p2.created_at ASC LIMIT 1), '') AS username, "
    "COALESCE((SELECT MAX(p3.created_at) FROM forum_posts p3 "
    "WHERE p3.thread_id = t.id), t.created_at) AS last_post_at, "
    "t.is_pinned, t.is_locked, "
    "COALESCE((SELECT f.name FROM forums f WHERE f.id = t.forum_id), '') "
    "AS forum_name ";
const char *kThreadFrom =
    "FROM forum_threads t LEFT JOIN users u ON u.id = t.user_id ";
// $1 = acting user id: author of the row, a moderator (role >= 2) or the
// owner of the site the row lives in.
const char *kThreadOwnerOrMod =
    "(user_id = $1::int OR EXISTS "
    "(SELECT 1 FROM users mu WHERE mu.id = $1::int AND mu.role >= 2) "
    "OR EXISTS (SELECT 1 FROM forums xf JOIN forum_categories xc "
    "ON xc.id = xf.category_id JOIN tenants xt ON xt.id = xc.tenant_id "
    "WHERE xf.id = forum_threads.forum_id AND xt.owner_id = $1::int))";
const char *kPostOwnerOrMod =
    "(user_id = $1::int OR EXISTS "
    "(SELECT 1 FROM users mu WHERE mu.id = $1::int AND mu.role >= 2) "
    "OR EXISTS (SELECT 1 FROM forum_threads xh JOIN forums xf "
    "ON xf.id = xh.forum_id JOIN forum_categories xc "
    "ON xc.id = xf.category_id JOIN tenants xt ON xt.id = xc.tenant_id "
    "WHERE xh.id = forum_posts.thread_id AND xt.owner_id = $1::int))";
} // namespace

} // namespace pyracms
