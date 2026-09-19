#include "services/ArticleService.h"

namespace pyracms {

// A revision is only reachable through the article it belongs to.
void ArticleService::getRevision(const DbClientPtr &db, int articleId,
                                 int revisionId, RevisionCallback cb) {
    db->execSqlAsync(
        "SELECT ar.*, u.username AS author_username "
        "FROM article_revisions ar "
        "LEFT JOIN users u ON u.id = ar.user_id "
        "WHERE ar.id = $1 AND ar.article_id = $2",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToRevisionDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        revisionId, articleId);
}

} // namespace pyracms
