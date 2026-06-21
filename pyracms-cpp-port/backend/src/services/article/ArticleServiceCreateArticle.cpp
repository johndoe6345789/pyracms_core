#include "services/ArticleService.h"
#include "services/CacheService.h"
#include "services/ElasticsearchService.h"

namespace pyracms {

void ArticleService::createArticle(const DbClientPtr &db, int tenantId,
                                    const std::string &name,
                                    const std::string &displayName,
                                    const std::string &content,
                                    const std::string &renderer,
                                    int userId,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO articles (tenant_id, name, display_name, is_private, "
        "hide_display_name, user_id, renderer_name, view_count, created_at) "
        "VALUES ($1, $2, $3, false, false, $4, $5, 0, NOW()) "
        "RETURNING id",
        [this, db, tenantId, name, displayName, content, userId, cb](const drogon::orm::Result &result) {
            int articleId = result[0]["id"].as<int>();
            // Create the initial revision
            db->execSqlAsync(
                "INSERT INTO article_revisions (article_id, content, summary, "
                "user_id, created_at) "
                "VALUES ($1, $2, 'Initial revision', $3, NOW())",
                [tenantId, name, displayName, content, articleId, cb](const drogon::orm::Result &) {
                    // Invalidate cache
                    CacheService::instance().invalidateArticle(tenantId, name);
                    // Index in Elasticsearch
                    if (ElasticsearchService::instance().isConfigured()) {
                        ElasticsearchService::instance().indexArticle(
                            tenantId, articleId, name, displayName, content, "");
                    }
                    cb(true, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                articleId, content, userId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name, displayName, userId, renderer);
}

} // namespace pyracms
