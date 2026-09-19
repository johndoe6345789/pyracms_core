#include "services/ArticleService.h"
#include "services/article/ArticleVisibility.h"

namespace pyracms {

// Read path: counts a view and honours visibility (see ArticleVisibility).
void ArticleService::getArticle(const DbClientPtr &db, int tenantId,
                                const std::string &name, int viewerId,
                                ArticleCallback cb) {
    db->execSqlAsync(
        "UPDATE articles a SET view_count = view_count + 1 "
        "WHERE a.tenant_id = $1 AND a.name = $2 AND " +
            articleVisibleSql("$3::int") + " RETURNING a.*",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToArticleDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        tenantId, name, viewerId);
}

// Plain lookup for callers that already passed an ownership check.
void ArticleService::findArticle(const DbClientPtr &db, int tenantId,
                                 const std::string &name,
                                 ArticleCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM articles WHERE tenant_id = $1 AND name = $2",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToArticleDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        tenantId, name);
}

} // namespace pyracms
