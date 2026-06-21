#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::publishDueArticles(const DbClientPtr &db,
                                         BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'published', published_at = NOW() "
        "WHERE status = 'scheduled' AND scheduled_at <= NOW()",
        [cb](const drogon::orm::Result &result) {
            cb(true, std::to_string(result.affectedRows()) + " articles published");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        });
}

} // namespace pyracms
