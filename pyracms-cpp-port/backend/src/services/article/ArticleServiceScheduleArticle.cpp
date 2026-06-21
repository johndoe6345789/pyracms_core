#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::scheduleArticle(const DbClientPtr &db, int articleId,
                                      const std::string &scheduledAt,
                                      BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'scheduled', scheduled_at = $2 "
        "WHERE id = $1",
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
        articleId, scheduledAt);
}

} // namespace pyracms
