#include "services/ArticleService.h"
#include "services/DbError.h"

namespace pyracms {

void ArticleService::voteArticle(const DbClientPtr &db, int articleId,
                                  int userId, bool isLike,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO article_votes (article_id, user_id, is_like) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (article_id, user_id) DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        articleId, userId, isLike);
}

} // namespace pyracms
