#include "services/CodeSnippetService.h"
#include "services/DbError.h"

namespace pyracms {

void CodeSnippetService::addAttachment(const DbClientPtr &db, int snippetId,
                                       int userId,
                                       const std::string &fileUuid,
                                       BoolCallback cb) {
    // Only the snippet's own author may attach a file to it, same rule as
    // updateSnippet/deleteSnippet; the file itself just needs to exist.
    db->execSqlAsync(
        "INSERT INTO snippet_attachments (snippet_id, file_id) "
        "SELECT s.id, f.id FROM code_snippets s, files f "
        "WHERE s.id = $1 AND s.author_id = $2 AND f.uuid = $3 "
        "ON CONFLICT (snippet_id, file_id) DO NOTHING RETURNING id",
        [cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, "Snippet not found, not yours, or already "
                          "attached, or the file does not exist");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        snippetId, userId, fileUuid);
}

} // namespace pyracms
