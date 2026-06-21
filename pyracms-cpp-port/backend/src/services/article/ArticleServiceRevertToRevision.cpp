#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::revertToRevision(const DbClientPtr &db, int articleId,
                                       int revisionId, int userId,
                                       BoolCallback cb) {
    // Get the content from the target revision, then create a new revision
    db->execSqlAsync(
        "SELECT content FROM article_revisions WHERE id = $1 AND article_id = $2",
        [this, db, articleId, userId, revisionId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, "Revision not found");
                return;
            }
            auto content = result[0]["content"].as<std::string>();
            auto summary = "Reverted to revision " + std::to_string(revisionId);
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
        revisionId, articleId);
}

} // namespace pyracms
