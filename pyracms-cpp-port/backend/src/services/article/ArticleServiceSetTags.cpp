#include "services/ArticleService.h"
#include "services/DbError.h"
#include "services/TagRules.h"

namespace pyracms {

// One statement, so a half-applied tag list can't happen: drop the tags no
// longer wanted, add the new ones (case-insensitively unique per article).
void ArticleService::setTags(const DbClientPtr &db, int articleId,
                             const std::vector<std::string> &tags,
                             BoolCallback cb) {
    db->execSqlAsync(
        "WITH want AS (SELECT t FROM unnest(string_to_array($2, E'\\n')) t "
        "WHERE t <> ''), "
        "d AS (DELETE FROM article_tags WHERE article_id = $1::int "
        "AND lower(name) NOT IN (SELECT lower(t) FROM want)) "
        "INSERT INTO article_tags (article_id, name) "
        "SELECT $1::int, w.t FROM want w WHERE NOT EXISTS (SELECT 1 "
        "FROM article_tags x WHERE x.article_id = $1::int "
        "AND lower(x.name) = lower(w.t))",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        articleId, joinTags(normalizeTags(tags)));
}

} // namespace pyracms
