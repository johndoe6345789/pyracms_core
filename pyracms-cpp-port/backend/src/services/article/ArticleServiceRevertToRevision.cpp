#include "services/ArticleService.h"
#include "services/DbError.h"

namespace pyracms {

void ArticleService::revertToRevision(const DbClientPtr &db, int articleId,
                                      int revisionId, int userId,
                                      BoolCallback cb) {
    // Get the content from the target revision, then create a new revision
    db->execSqlAsync(
        "SELECT content FROM article_revisions WHERE id = $1 AND article_id = "
        "$2",
        [this, db, articleId, userId, revisionId,
         cb](const drogon::orm::Result &result) {
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
                [this, db, articleId, cb](const drogon::orm::Result &) {
                    refreshSearchIndex(db, articleId);
                    cb(true, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, dbError(e));
                },
                articleId, content, summary, userId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        revisionId, articleId);
}

} // namespace pyracms
