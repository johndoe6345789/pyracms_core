#include "controllers/CodeSnippetController.h"
#include "controllers/SnippetInput.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "filters/Viewer.h"

namespace pyracms {

void CodeSnippetController::createSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("title") || !(*json).isMember("code") ||
        !(*json).isMember("tenant_id")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "title, code, and tenant_id required";
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
    auto title = (*json)["title"].asString();
    auto code = (*json)["code"].asString();
    auto language = (*json).get("language", "python").asString();
    auto visibility = (*json).get("visibility", "public").asString();
    int tenantId = (*json)["tenant_id"].asInt();
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    snippetService_.createSnippet(
        db, tenantId, userId, title, code, language, visibility,
        [callback](bool success, int snippetId, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["message"] = "Snippet created";
            result["id"] = snippetId;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
