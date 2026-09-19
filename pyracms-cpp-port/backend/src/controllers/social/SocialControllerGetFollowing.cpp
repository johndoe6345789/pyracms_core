#include "controllers/SocialController.h"
#include "filters/UserVisibility.h"

namespace pyracms {

void SocialController::getFollowing(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    int limit = 20, offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    limit = clampLimit(limitStr, limit, 100);
    offset = clampOffset(offsetStr);

    auto db = drogon::app().getDbClient();

    socialService_.getFollowing(
        db, userId, limit, offset,
        [callback](const std::vector<UserFollowDto> &following, int total) {
            Json::Value response;
            response["total"] = total;
            response["items"] = Json::Value(Json::arrayValue);
            for (const auto &f : following) {
                Json::Value item;
                item["userId"] = f.userId;
                item["username"] = f.username;
                item["avatarUrl"] = f.avatarUrl;
                item["createdAt"] = f.createdAt;
                response["items"].append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(response));
        });
}

} // namespace pyracms
