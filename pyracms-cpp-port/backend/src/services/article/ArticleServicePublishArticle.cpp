#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::publishArticle(const DbClientPtr &db, int articleId,
                                     BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'published', published_at = NOW(), "
        "scheduled_at = NULL WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        articleId);
}

} // namespace pyracms
