#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::voteArticle(const DbClientPtr &db, int articleId,
                                  int userId, bool isLike,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO article_votes (article_id, user_id, is_like, created_at) "
        "VALUES ($1, $2, $3, NOW()) "
        "ON CONFLICT (article_id, user_id) DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId, userId, isLike);
}

} // namespace pyracms
