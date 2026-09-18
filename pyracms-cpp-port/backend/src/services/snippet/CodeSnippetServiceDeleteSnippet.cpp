#include "services/CodeSnippetService.h"

namespace pyracms {

void CodeSnippetService::deleteSnippet(const DbClientPtr &db, int snippetId,
                                       int userId, BoolCallback cb) {

    db->execSqlAsync(
        "DELETE FROM code_snippets WHERE id = $1 AND author_id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Snippet not found or not owned by user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        snippetId, userId);
}

} // namespace pyracms
