#include "controllers/CommentController.h"
#include "security/Validate.h"

namespace pyracms {

void CommentController::updateComment(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto userId = req->attributes()->get<int>("userId");
    auto json = req->getJsonObject();

    if (!json || !(*json).isMember("body")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "body is required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    if (!(*json)["body"].isString() || (*json)["body"].asString().empty() ||
        !isBoundedText((*json)["body"].asString(), 10000)) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "body must be 1-10000 characters";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }
    auto body = (*json)["body"].asString();
    auto db = drogon::app().getDbClient();

    commentService_.updateComment(
        db, id, userId, body,
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
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
