#include "controllers/CodeSnippetController.h"

namespace pyracms {

void CodeSnippetController::removeAttachment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id, const std::string &attachmentId) {

    int snippetId = std::stoi(id);
    int attId = std::stoi(attachmentId);
    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    snippetService_.removeAttachment(
        db, snippetId, attId, userId,
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
            result["message"] = "Attachment removed";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
