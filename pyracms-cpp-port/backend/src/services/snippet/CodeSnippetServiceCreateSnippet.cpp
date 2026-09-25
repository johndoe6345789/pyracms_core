#include "services/CodeSnippetService.h"
#include "services/DbError.h"

namespace pyracms {

void CodeSnippetService::createSnippet(
    const DbClientPtr &db, int tenantId, int authorId, const std::string &title,
    const std::string &code, const std::string &language,
    const std::string &visibility,
    std::function<void(bool success, int snippetId, const std::string &error)>
        cb) {

    db->execSqlAsync(
        "WITH s AS (INSERT INTO code_snippets (tenant_id, author_id, title, "
        "code, language, visibility) "
        "VALUES ($1, $2, $3, $4, $5, $6) "
        "RETURNING id, title, code, language, author_id), "
        "r AS (INSERT INTO snippet_revisions (snippet_id, title, code, "
        "language, summary, user_id) SELECT id, title, code, language, "
        "'Initial revision', author_id FROM s) SELECT id FROM s",
        [cb](const drogon::orm::Result &result) {
            int newId = result[0]["id"].as<int>();
            cb(true, newId, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, dbError(e));
        },
        tenantId, authorId, title, code, language, visibility);
}

} // namespace pyracms
