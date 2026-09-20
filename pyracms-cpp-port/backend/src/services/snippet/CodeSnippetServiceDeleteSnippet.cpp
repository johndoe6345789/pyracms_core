#include "services/CodeSnippetService.h"
#include "services/DbError.h"
#include "services/ModerationSql.h"

namespace pyracms {

void CodeSnippetService::deleteSnippet(const DbClientPtr &db, int snippetId,
                                       int userId, BoolCallback cb) {

    db->execSqlAsync(
        "DELETE FROM code_snippets WHERE id = $1 AND (author_id = $2 OR " +
            canModerateSql("$2", "code_snippets.tenant_id") + ")",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Snippet not found or not permitted");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        snippetId, userId);
}

} // namespace pyracms
