#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::getRevision(const DbClientPtr &db, int revisionId,
                                  RevisionCallback cb) {
    db->execSqlAsync(
        "SELECT ar.*, u.username AS author_username "
        "FROM article_revisions ar "
        "LEFT JOIN users u ON u.id = ar.user_id "
        "WHERE ar.id = $1",
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
        revisionId);
}

} // namespace pyracms
