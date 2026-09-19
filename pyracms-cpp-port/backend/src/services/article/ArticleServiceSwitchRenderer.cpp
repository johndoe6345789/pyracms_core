#include "services/ArticleService.h"
#include "services/DbError.h"

namespace pyracms {

void ArticleService::switchRenderer(const DbClientPtr &db, int articleId,
                                     const std::string &renderer,
                                     BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE articles SET renderer_name = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Article not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        renderer, articleId);
}

} // namespace pyracms
