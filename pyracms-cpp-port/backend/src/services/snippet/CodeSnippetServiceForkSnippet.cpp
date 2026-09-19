#include "services/CodeSnippetService.h"
#include "services/DbError.h"

namespace pyracms {

void CodeSnippetService::forkSnippet(
    const DbClientPtr &db, int snippetId, int userId, int tenantId,
    std::function<void(bool success, int newId, const std::string &error)> cb) {

    db->execSqlAsync(
        "SELECT * FROM code_snippets WHERE id = $1 AND tenant_id = $3 "
        "AND (visibility = 'public' OR author_id = $2)",
        [this, db, userId, tenantId, snippetId,
         cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(false, 0, "Snippet not found");
                return;
            }

            auto title = result[0]["title"].as<std::string>() + " (fork)";
            auto code = result[0]["code"].as<std::string>();
            auto language = result[0]["language"].as<std::string>();

            db->execSqlAsync(
                "INSERT INTO code_snippets (tenant_id, author_id, title, code, "
                "language, "
                "visibility, forked_from) "
                "VALUES ($1, $2, $3, $4, $5, 'public', $6) RETURNING id",
                [cb](const drogon::orm::Result &insertResult) {
                    int newId = insertResult[0]["id"].as<int>();
                    cb(true, newId, "");
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, 0, dbError(e));
                },
                tenantId, userId, title, code, language, snippetId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, dbError(e));
        },
        snippetId, userId, tenantId);
}

} // namespace pyracms
