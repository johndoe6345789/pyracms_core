#pragma once

namespace pyracms {

// $1 thread, $2 target forum, $3 caller, $4 caller's site (0 = platform).
// Moves only inside the thread's own site, for a moderator or the site's
// owner, and keeps the forums' thread/post counters in step.
constexpr const char *kMoveThreadSql =
    "WITH old AS (SELECT t.id, t.forum_id, COALESCE(t.total_posts, 0) AS n, "
    "oc.tenant_id AS tenant FROM forum_threads t "
    "JOIN forums ofo ON ofo.id = t.forum_id "
    "JOIN forum_categories oc ON oc.id = ofo.category_id "
    "WHERE t.id = $1::int), "
    "mv AS (UPDATE forum_threads t SET forum_id = $2::int FROM old "
    "JOIN forums nf ON nf.id = $2::int "
    "JOIN forum_categories nc ON nc.id = nf.category_id "
    "WHERE t.id = old.id AND nc.tenant_id = old.tenant "
    "AND ($4::int = 0 OR old.tenant = $4::int) "
    "AND (EXISTS (SELECT 1 FROM users mu WHERE mu.id = $3::int "
    "AND mu.role >= 2) OR EXISTS (SELECT 1 FROM tenants xt "
    "WHERE xt.id = old.tenant AND xt.owner_id = $3::int)) "
    "RETURNING old.forum_id AS oldf, old.n AS n), "
    "dcr AS (UPDATE forums SET total_threads = GREATEST(total_threads - 1, "
    "0), total_posts = GREATEST(total_posts - (SELECT n FROM mv), 0) "
    "WHERE id = (SELECT oldf FROM mv) AND (SELECT oldf FROM mv) <> $2::int), "
    "icr AS (UPDATE forums SET total_threads = total_threads + 1, "
    "total_posts = total_posts + (SELECT n FROM mv) WHERE id = $2::int "
    "AND (SELECT oldf FROM mv) <> $2::int) "
    "SELECT COUNT(*)::int AS moved FROM mv";

} // namespace pyracms
