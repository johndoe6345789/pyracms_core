#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::listArticles(const DbClientPtr &db, int tenantId,
                                   int limit, int offset,
                                   ArticleListCallback cb) {
    db->execSqlAsync(
        "SELECT a.*, u.username AS author_username "
        "FROM articles a LEFT JOIN users u ON u.id = a.user_id "
        "WHERE a.tenant_id = $1 AND a.is_private = false "
        "ORDER BY a.created_at DESC LIMIT " + std::to_string(limit) + " OFFSET " + std::to_string(offset),
        [this, cb](const drogon::orm::Result &result) {
            std::vector<ArticleDto> articles;
            articles.reserve(result.size());
            for (const auto &row : result) {
                auto dto = rowToArticleDto(row);
                dto.authorUsername = row["author_username"].isNull()
                    ? "Unknown" : row["author_username"].as<std::string>();
                articles.push_back(std::move(dto));
            }
            cb(articles);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "listArticles error: " << e.base().what();
            cb({});
        },
        tenantId);
}

} // namespace pyracms
