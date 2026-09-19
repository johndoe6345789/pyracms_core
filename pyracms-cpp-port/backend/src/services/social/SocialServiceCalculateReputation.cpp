#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::calculateReputation(
    const DbClientPtr &db, int userId,
    std::function<void(const ReputationDto &)> cb) {
    db->execSqlAsync(
        "SELECT "
        "  (SELECT COUNT(*) FROM forum_posts WHERE user_id = $1)::int AS "
        "post_count, "
        "  (SELECT COALESCE(SUM(CASE WHEN v.is_like THEN 1 ELSE 0 END), 0) "
        "   FROM article_votes v JOIN articles a ON a.id = v.article_id "
        "   WHERE a.user_id = $1)::int AS upvote_count, "
        "  (SELECT COUNT(*) FROM user_achievements WHERE user_id = $1)::int AS "
        "achievement_count",
        [cb](const drogon::orm::Result &result) {
            ReputationDto rep;
            if (result.empty()) {
                rep = {0, 0, 0, 0};
            } else {
                rep.postCount = result[0]["post_count"].as<int>();
                rep.upvoteCount = result[0]["upvote_count"].as<int>();
                rep.achievementCount = result[0]["achievement_count"].as<int>();
                rep.total = rep.postCount * 1 + rep.upvoteCount * 5 +
                            rep.achievementCount * 10;
            }
            cb(rep);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({0, 0, 0, 0}); },
        userId);
}

} // namespace pyracms
