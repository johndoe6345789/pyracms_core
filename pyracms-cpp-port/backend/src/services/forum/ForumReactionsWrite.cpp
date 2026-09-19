#include "services/ForumReactions.h"

namespace pyracms {

// One statement: toggle removes an existing row, else inserts it.
static const char *kToggle =
    "WITH del AS (DELETE FROM post_reactions WHERE post_id = $1::int "
    "AND user_id = $2::int AND emoji = $3 RETURNING 1) "
    "INSERT INTO post_reactions (post_id, user_id, emoji) "
    "SELECT $1::int, $2::int, $3 WHERE NOT EXISTS (SELECT 1 FROM del) "
    "ON CONFLICT DO NOTHING";
static const char *kRemove =
    "DELETE FROM post_reactions WHERE post_id = $1::int "
    "AND user_id = $2::int AND emoji = $3";

void setReaction(const drogon::orm::DbClientPtr &db, int postId, int userId,
                 const std::string &emoji, bool toggle,
                 std::function<void(bool ok)> cb) {
    db->execSqlAsync(
        toggle ? kToggle : kRemove,
        [cb](const drogon::orm::Result &) { cb(true); },
        [cb](const drogon::orm::DrogonDbException &) { cb(false); }, postId,
        userId, emoji);
}

} // namespace pyracms
