#include "services/ArticleService.h"
#include "services/CacheService.h"
#include "services/ElasticsearchService.h"

namespace pyracms {

void ArticleService::deleteArticle(const DbClientPtr &db, int tenantId,
                                    const std::string &name,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM articles WHERE tenant_id = $1 AND name = $2 RETURNING id",
        [tenantId, name, cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                CacheService::instance().invalidateArticle(tenantId, name);
                if (ElasticsearchService::instance().isConfigured()) {
                    ElasticsearchService::instance().deleteDocument(
                        "pyracms_articles", result[0]["id"].as<int>());
                }
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name);
}

} // namespace pyracms
