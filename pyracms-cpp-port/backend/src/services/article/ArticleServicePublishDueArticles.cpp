#include "services/ArticleService.h"
#include "services/DbError.h"
#include "services/WebhookEvents.h"

namespace pyracms {

// Every article that became due fires `article.published` for its own
// site, exactly like a manual publish.
void ArticleService::publishDueArticles(const DbClientPtr &db,
                                        BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'published', published_at = NOW() "
        "WHERE status = 'scheduled' AND scheduled_at <= NOW() "
        "RETURNING tenant_id, name",
        [cb](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                if (row["tenant_id"].isNull())
                    continue;
                Json::Value d;
                d["name"] = row["name"].as<std::string>();
                d["scheduled"] = true;
                fireWebhookEvent(row["tenant_id"].as<int>(),
                                 "article.published", d);
            }
            cb(true,
               std::to_string(result.affectedRows()) + " articles published");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        });
}

} // namespace pyracms
