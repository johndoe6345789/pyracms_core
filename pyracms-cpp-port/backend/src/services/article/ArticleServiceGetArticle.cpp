#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::getArticle(const DbClientPtr &db, int tenantId,
                                 const std::string &name,
                                 ArticleCallback cb) {
    // Increment view_count and return the article
    db->execSqlAsync(
        "UPDATE articles SET view_count = view_count + 1 "
        "WHERE tenant_id = $1 AND name = $2 "
        "RETURNING *",
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
