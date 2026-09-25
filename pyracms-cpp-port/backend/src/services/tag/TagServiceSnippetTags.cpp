#include "services/DbError.h"
#include "services/TagRules.h"
#include "services/TagService.h"

namespace pyracms {

// One statement: keep the tags still wanted, add the new ones. (Deleting
// everything and re-inserting in one statement would trip the unique index
// on a tag that stays.) The final SELECT says whether the snippet was ours.
void TagService::setSnippetTags(const DbClientPtr &db, int snippetId,
                                int userId,
                                const std::vector<std::string> &tags,
                                BoolCallback cb) {
    db->execSqlAsync(
        "WITH s AS (SELECT id FROM code_snippets "
        "WHERE id = $1 AND author_id = $2), "
        "want AS (SELECT t FROM unnest(string_to_array($3, E'\\n')) t "
        "WHERE t <> ''), "
        "d AS (DELETE FROM snippet_tags WHERE snippet_id IN (SELECT id FROM s) "
        "AND lower(name) NOT IN (SELECT lower(t) FROM want)), "
        "i AS (INSERT INTO snippet_tags (snippet_id, name) "
        "SELECT s.id, want.t FROM s, want ON CONFLICT DO NOTHING) "
        "SELECT count(*)::int AS n FROM s",
        [cb](const drogon::orm::Result &result) {
            if (result[0]["n"].as<int>() == 0)
                cb(false, "Snippet not found or not yours");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        snippetId, userId, joinTags(tags));
}

} // namespace pyracms
