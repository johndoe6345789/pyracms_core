#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::listArticlesByStatus(const DbClientPtr &db, int tenantId,
                                           const std::string &status,
                                           int limit, int offset,
                                           ArticleListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM articles WHERE tenant_id = $1 AND status = $2 "
        "ORDER BY created_at DESC LIMIT $3 OFFSET $4",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<ArticleDto> articles;
            articles.reserve(result.size());
            for (const auto &row : result) {
                articles.push_back(rowToArticleDto(row));
            }
            cb(articles);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId, status, limit, offset);
}

} // namespace pyracms
