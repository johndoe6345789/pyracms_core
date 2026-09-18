#include "services/CodeSnippetService.h"

namespace pyracms {

void CodeSnippetService::updateSnippet(const DbClientPtr &db, int snippetId,
                                       int userId, const std::string &title,
                                       const std::string &code,
                                       const std::string &language,
                                       const std::string &visibility,
                                       BoolCallback cb) {

    db->execSqlAsync(
        "UPDATE code_snippets SET title = $1, code = $2, language = $3, "
        "visibility = $4, updated_at = NOW() "
        "WHERE id = $5 AND author_id = $6",
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
        title, code, language, visibility, snippetId, userId);
}

} // namespace pyracms
