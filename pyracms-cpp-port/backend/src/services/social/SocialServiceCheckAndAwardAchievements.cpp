#include "services/DbError.h"
#include "services/SocialService.h"

#include <memory>
#include <mutex>
#include <regex>

namespace pyracms {

void SocialService::checkAndAwardAchievements(const DbClientPtr &db, int userId,
                                              BoolCallback cb) {
    // Check first_post: user has at least 1 forum post
    db->execSqlAsync(
        "SELECT "
        "  (SELECT COUNT(*) FROM forum_posts WHERE user_id = $1) AS "
        "post_count, "
        "  (SELECT COUNT(*) FROM articles WHERE user_id = $1) AS "
        "article_count, "
        "  (SELECT COUNT(*) FROM code_snippets WHERE author_id = $1) AS "
        "snippet_count, "
        "  (SELECT COALESCE(SUM(CASE WHEN v.is_like THEN 1 ELSE 0 END), 0) "
        "   FROM article_votes v JOIN articles a ON a.id = v.article_id "
        "   WHERE a.user_id = $1) AS upvote_count",
        [this, db, userId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(true, "");
                return;
            }

            auto postCount = result[0]["post_count"].as<int>();
            auto articleCount = result[0]["article_count"].as<int>();
            auto snippetCount = result[0]["snippet_count"].as<int>();
            auto upvoteCount = result[0]["upvote_count"].as<int>();

            auto remaining = std::make_shared<int>(0);

            auto checkAward = [this, db, userId, remaining,
                               cb](const std::string &name, bool condition) {
                if (condition) {
                    (*remaining)++;
                    awardAchievement(
                        db, userId, name,
                        [remaining, cb](bool, const std::string &) {
                            (*remaining)--;
                            if (*remaining == 0)
                                cb(true, "");
                        });
                }
            };

            checkAward("first_post", postCount >= 1);
            checkAward("hundred_posts", postCount >= 100);
            checkAward("helpful", upvoteCount >= 50);
            checkAward("first_article", articleCount >= 1);
            checkAward("first_snippet", snippetCount >= 1);

            if (*remaining == 0)
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        userId);
}

} // namespace pyracms
