#include "services/CodeSnippetService.h"
#include "services/DbError.h"

namespace pyracms {

// One statement, so the snippet and its history cannot disagree. A revision
// is only added when title/code/language actually changed: a visibility
// change, or the editor's Run (which saves first), leaves history alone.
void CodeSnippetService::updateSnippet(const DbClientPtr &db, int snippetId,
                                       int userId, const std::string &title,
                                       const std::string &code,
                                       const std::string &language,
                                       const std::string &visibility,
                                       const std::string &summary,
                                       BoolCallback cb) {
    db->execSqlAsync(
        "WITH old AS (SELECT title, code, language FROM code_snippets "
        "WHERE id = $5 AND author_id = $6), "
        "upd AS (UPDATE code_snippets SET title = $1, code = $2, "
        "language = $3, visibility = $4, updated_at = NOW() "
        "WHERE id = $5 AND author_id = $6 "
        "RETURNING id, title, code, language), "
        "rev AS (INSERT INTO snippet_revisions (snippet_id, title, code, "
        "language, summary, user_id) "
        "SELECT u.id, u.title, u.code, u.language, $7, $6 FROM upd u, old o "
        "WHERE (u.title, u.code, u.language) IS DISTINCT FROM "
        "(o.title, o.code, o.language)) "
        "SELECT count(*)::int AS n FROM upd",
        [cb](const drogon::orm::Result &result) {
            if (result[0]["n"].as<int>() == 0) {
                cb(false, "Snippet not found or not owned by user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        title, code, language, visibility, snippetId, userId, summary);
}

} // namespace pyracms
