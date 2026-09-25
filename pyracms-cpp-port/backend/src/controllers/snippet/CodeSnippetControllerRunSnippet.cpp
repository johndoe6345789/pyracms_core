#include "controllers/CodeSnippetController.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "filters/Viewer.h"
#include "services/SnippetInputs.h"

namespace pyracms {

void CodeSnippetController::runSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int snippetId = std::stoi(id);
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    snippetService_.getSnippet(
        db, snippetId, tokenTenantOf(req), userId,
        [this, db, snippetId, userId,
         callback](const std::optional<CodeSnippetDto> &snippet) {
            if (!snippet) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Snippet not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            if (!dockerService_.isLanguageSupported(snippet->language)) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] =
                    "Unsupported language: " + snippet->language;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }

            auto finish = [this, db, snippetId, userId,
                           callback](const ExecutionResult &execResult) {
                // Record the execution in the database
                snippetService_.recordExecution(
                    db, snippetId, userId, execResult.output,
                    execResult.exitCode, execResult.executionTimeMs,
                    [execResult, callback](bool, const std::string &) {
                        Json::Value result;
                        result["exitCode"] = execResult.exitCode;
                        result["output"] = execResult.output;
                        result["executionTimeMs"] = execResult.executionTimeMs;
                        callback(
                            drogon::HttpResponse::newHttpJsonResponse(result));
                    });
            };
            // The snippet's attachments are its input files: staged into
            // the sandbox so open("name.txt") finds them.
            auto language = snippet->language;
            auto code = snippet->code;
            loadSnippetInputs(db, snippetId, [=](std::vector<RunInput> in) {
                dockerService_.executeCode(language, code, std::move(in),
                                           finish);
            });
        });
}

} // namespace pyracms
