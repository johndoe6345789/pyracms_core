#include "services/ForumReactions.h"

#include <set>

namespace pyracms {

bool isAllowedEmoji(const std::string &emoji) {
    static const std::set<std::string> ok = {"thumbs_up", "heart", "laugh",
                                             "wow",       "sad",   "party"};
    return ok.count(emoji) > 0;
}

static const char *kReactionCols =
    "SELECT r.post_id, r.emoji, COUNT(*)::int AS cnt, "
    "COALESCE(BOOL_OR(r.user_id = $2::int), FALSE) AS mine "
    "FROM post_reactions r JOIN forum_posts p ON p.id = r.post_id ";
static const char *kReactionEnd =
    "GROUP BY r.post_id, r.emoji ORDER BY r.post_id, r.emoji";

static void fill(const drogon::orm::Result &rows, ReactionMap &out) {
    for (const auto &r : rows) {
        Json::Value j;
        j["emoji"] = r["emoji"].as<std::string>();
        j["count"] = r["cnt"].as<int>();
        j["mine"] = r["mine"].as<bool>();
        auto &arr = out[r["post_id"].as<int>()];
        if (!arr.isArray())
            arr = Json::Value(Json::arrayValue);
        arr.append(j);
    }
}

void loadThreadReactions(const drogon::orm::DbClientPtr &db, int threadId,
                         int viewerId, std::function<void(ReactionMap)> cb) {
    db->execSqlAsync(
        std::string(kReactionCols) + "WHERE p.thread_id = $1::int " +
            kReactionEnd,
        [cb](const drogon::orm::Result &rows) {
            ReactionMap out;
            fill(rows, out);
            cb(out);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, threadId,
        viewerId);
}

void loadPostReactions(const drogon::orm::DbClientPtr &db, int postId,
                       int viewerId, std::function<void(Json::Value)> cb) {
    db->execSqlAsync(
        std::string(kReactionCols) + "WHERE p.id = $1::int " + kReactionEnd,
        [cb, postId](const drogon::orm::Result &rows) {
            ReactionMap out;
            fill(rows, out);
            cb(out.count(postId) ? out[postId]
                                 : Json::Value(Json::arrayValue));
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(Json::Value(Json::arrayValue));
        },
        postId, viewerId);
}

void tenantOfPost(const drogon::orm::DbClientPtr &db, int postId,
                  std::function<void(bool ok, int tenant)> cb) {
    db->execSqlAsync(
        "SELECT c.tenant_id FROM forum_posts p "
        "JOIN forum_threads t ON t.id = p.thread_id "
        "JOIN forums f ON f.id = t.forum_id "
        "JOIN forum_categories c ON c.id = f.category_id WHERE p.id = $1",
        [cb](const drogon::orm::Result &r) {
            cb(true, r.empty() || r[0][0].isNull() ? 0 : r[0][0].as<int>());
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(false, 0); },
        postId);
}

} // namespace pyracms
