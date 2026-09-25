#include "controllers/CodeSnippetController.h"
#include "controllers/SnippetInput.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "filters/Viewer.h"

namespace pyracms {

void CodeSnippetController::updateSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    auto json = req->getJsonObject();
    if (!json) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "JSON body required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto problem = snippetProblem(*json);
    if (!problem.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = problem;
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }
    int snippetId = std::stoi(id);
    int userId = req->attributes()->get<int>("userId");
    auto title = (*json).get("title", "").asString();
    auto code = (*json).get("code", "").asString();
    auto language = (*json).get("language", "python").asString();
    auto visibility = (*json).get("visibility", "public").asString();
    auto summary = (*json).get("summary", "").asString();
    auto db = drogon::app().getDbClient();

    snippetService_.updateSnippet(
        db, snippetId, userId, title, code, language, visibility, summary,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Snippet updated";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
