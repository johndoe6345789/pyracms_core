#include "services/ArticleService.h"
#include "services/DbError.h"
#include "services/article/ArticleVisibility.h"

namespace pyracms {

void ArticleService::listArticles(const DbClientPtr &db, int tenantId,
                                  int limit, int offset, int viewerId,
                                  ArticleListCallback cb) {
    db->execSqlAsync(
        "SELECT a.*, u.username AS author_username "
        "FROM articles a LEFT JOIN users u ON u.id = a.user_id "
        "WHERE a.tenant_id = $1 AND " +
            articleVisibleSql("$4::int") +
            " ORDER BY a.created_at DESC LIMIT $2::int OFFSET $3::int",
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
            LOG_ERROR << "listArticles error: " << dbError(e);
            cb({});
        },
        tenantId, limit, offset, viewerId);
}

} // namespace pyracms
