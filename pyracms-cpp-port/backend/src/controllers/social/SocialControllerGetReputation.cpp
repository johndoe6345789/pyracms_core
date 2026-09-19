#include "controllers/SocialController.h"
#include "filters/UserVisibility.h"

namespace pyracms {

void SocialController::getReputation(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    socialService_.calculateReputation(
        db, userId, [callback](const ReputationDto &rep) {
            Json::Value result;
            result["total"] = rep.total;
            result["postCount"] = rep.postCount;
            result["upvoteCount"] = rep.upvoteCount;
            result["achievementCount"] = rep.achievementCount;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
