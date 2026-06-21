#include "services/ArticleService.h"

namespace pyracms {

void ArticleService::listRevisions(const DbClientPtr &db, int articleId,
                                    RevisionListCallback cb) {
    db->execSqlAsync(
        "SELECT ar.*, u.username AS author_username "
        "FROM article_revisions ar "
        "LEFT JOIN users u ON u.id = ar.user_id "
        "WHERE ar.article_id = $1 "
        "ORDER BY ar.created_at DESC",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<ArticleRevisionDto> revisions;
            revisions.reserve(result.size());
            for (const auto &row : result) {
                revisions.push_back(rowToRevisionDto(row));
            }
            cb(revisions);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        articleId);
}

} // namespace pyracms
