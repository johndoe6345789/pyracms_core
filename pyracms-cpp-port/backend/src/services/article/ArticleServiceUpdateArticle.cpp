#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::updateArticle(const DbClientPtr &db, int tenantId,
                                    const std::string &name,
                                    const std::string &content,
                                    const std::string &summary,
                                    int userId,
                                    BoolCallback cb) {
    // Find the article first, then create a new revision
    db->execSqlAsync(
        "SELECT id FROM articles WHERE tenant_id = $1 AND name = $2",
        [this, db, content, summary, userId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, "Article not found");
                return;
            }
            int articleId = result[0]["id"].as<int>();
            db->execSqlAsync(
                "INSERT INTO article_revisions (article_id, content, summary, "
                "user_id, created_at) "
                "VALUES ($1, $2, $3, $4, NOW())",
                [cb](const drogon::orm::Result &) {
                    cb(true, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, e.base().what());
                },
                articleId, content, summary, userId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, name);
}

} // namespace pyracms
