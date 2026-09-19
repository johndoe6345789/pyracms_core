#include "services/CodeSnippetService.h"
#include "services/DbError.h"

namespace pyracms {

void CodeSnippetService::recordExecution(const DbClientPtr &db, int snippetId,
                                         int userId, const std::string &output,
                                         int exitCode, int executionTimeMs,
                                         BoolCallback cb) {

    // Record execution and increment run_count
    db->execSqlAsync(
        "INSERT INTO snippet_executions (snippet_id, user_id, output, "
        "exit_code, execution_time_ms) "
        "VALUES ($1, $2, $3, $4, $5)",
        [db, snippetId, cb](const drogon::orm::Result &) {
            db->execSqlAsync(
                "UPDATE code_snippets SET run_count = run_count + 1 WHERE id = "
                "$1",
                [cb](const drogon::orm::Result &) { cb(true, ""); },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(false, dbError(e));
                },
                snippetId);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        snippetId, userId, output, exitCode, executionTimeMs);
}

} // namespace pyracms
