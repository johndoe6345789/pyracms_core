#include "controllers/SocialController.h"
#include "filters/UserVisibility.h"

namespace pyracms {

void SocialController::follow(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int followerId = req->attributes()->get<int>("userId");
    int followedId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    socialService_.followUser(
        db, followerId, followedId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }
            Json::Value result;
            result["message"] = "Following";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
