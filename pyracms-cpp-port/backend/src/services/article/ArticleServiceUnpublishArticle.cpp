#include "services/ArticleService.h"
#include "services/DbError.h"

namespace pyracms {

void ArticleService::unpublishArticle(const DbClientPtr &db, int articleId,
                                       BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET status = 'unpublished' WHERE id = $1",
        [this, db, articleId, cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                refreshSearchIndex(db, articleId);
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        articleId);
}

} // namespace pyracms
