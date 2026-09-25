#include "services/CodeSnippetService.h"
#include "services/DbError.h"

namespace pyracms {

void CodeSnippetService::removeAttachment(const DbClientPtr &db,
                                          int snippetId, int attachmentId,
                                          int userId, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM snippet_attachments a USING code_snippets s "
        "WHERE a.id = $1 AND a.snippet_id = $2 AND s.id = a.snippet_id "
        "AND s.author_id = $3",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Attachment not found or not owned by user");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        attachmentId, snippetId, userId);
}

} // namespace pyracms
