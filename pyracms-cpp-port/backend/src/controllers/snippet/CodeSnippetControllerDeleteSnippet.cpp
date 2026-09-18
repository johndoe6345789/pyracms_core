#include "controllers/CodeSnippetController.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "filters/Viewer.h"

namespace pyracms {

void CodeSnippetController::deleteSnippet(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int snippetId = std::stoi(id);
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    snippetService_.deleteSnippet(
        db, snippetId, userId,
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
            result["message"] = "Snippet deleted";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
