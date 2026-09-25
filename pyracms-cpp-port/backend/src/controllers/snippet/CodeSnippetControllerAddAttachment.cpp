#include "controllers/CodeSnippetController.h"
#include "security/Validate.h"

namespace pyracms {

void CodeSnippetController::addAttachment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("fileUuid") ||
        !(*json)["fileUuid"].isString() ||
        !isValidUuid((*json)["fileUuid"].asString())) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] =
            "fileUuid must be an uploaded file";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int snippetId = std::stoi(id);
    int userId = req->attributes()->get<int>("userId");
    auto fileUuid = (*json)["fileUuid"].asString();
    auto db = drogon::app().getDbClient();

    snippetService_.addAttachment(
        db, snippetId, userId, fileUuid,
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
            result["message"] = "Attachment added";
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
