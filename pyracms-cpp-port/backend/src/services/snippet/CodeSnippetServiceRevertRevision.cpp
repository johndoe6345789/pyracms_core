#include "services/CodeSnippetService.h"
#include "services/DbError.h"

namespace pyracms {

// Author only, one statement: put revision `number` back on the snippet and
// record that as a new revision. Nothing inserted = no such revision, or the
// snippet is not the caller's.
void CodeSnippetService::revertToRevision(const DbClientPtr &db, int snippetId,
                                          int number, int userId,
                                          BoolCallback cb) {
    db->execSqlAsync(
        "WITH t AS (SELECT title, code, language FROM "
        "(SELECT *, row_number() OVER (ORDER BY id) AS rn "
        "FROM snippet_revisions WHERE snippet_id = $1) x WHERE rn = $2::int), "
        "u AS (UPDATE code_snippets s SET title = t.title, code = t.code, "
        "language = t.language, updated_at = NOW() FROM t "
        "WHERE s.id = $1 AND s.author_id = $3 "
        "RETURNING s.id, s.title, s.code, s.language) "
        "INSERT INTO snippet_revisions (snippet_id, title, code, language, "
        "summary, user_id) SELECT id, title, code, language, "
        "'Reverted to revision ' || $2::int::text, $3 FROM u",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Revision not found or snippet not owned by user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        snippetId, number, userId);
}

} // namespace pyracms
