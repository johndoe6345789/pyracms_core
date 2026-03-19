#include "controllers/SocialController.h"

namespace pyracms {

void SocialController::follow(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int followerId = req->attributes()->get<int>("userId");
    int followedId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    socialService_.followUser(db, followerId, followedId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
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

void SocialController::unfollow(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int followerId = req->attributes()->get<int>("userId");
    int followedId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    socialService_.unfollowUser(db, followerId, followedId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }
            Json::Value result;
            result["message"] = "Unfollowed";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void SocialController::getFollowers(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    int limit = 20, offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    if (!limitStr.empty()) limit = std::stoi(limitStr);
    if (!offsetStr.empty()) offset = std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();

    socialService_.getFollowers(db, userId, limit, offset,
        [callback](const std::vector<UserFollowDto> &followers, int total) {
            Json::Value response;
            response["total"] = total;
            response["items"] = Json::Value(Json::arrayValue);
            for (const auto &f : followers) {
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

void SocialController::getFollowing(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    int limit = 20, offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    if (!limitStr.empty()) limit = std::stoi(limitStr);
    if (!offsetStr.empty()) offset = std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();

    socialService_.getFollowing(db, userId, limit, offset,
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

void SocialController::getActivity(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    int limit = 20, offset = 0;
    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    if (!limitStr.empty()) limit = std::stoi(limitStr);
    if (!offsetStr.empty()) offset = std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();

    socialService_.getActivityFeed(db, userId, limit, offset,
        [callback](const std::vector<ActivityItem> &items) {
            Json::Value result(Json::arrayValue);
            for (const auto &item : items) {
                Json::Value jsonItem;
                jsonItem["type"] = item.type;
                jsonItem["id"] = item.id;
                jsonItem["title"] = item.title;
                jsonItem["summary"] = item.summary;
                jsonItem["createdAt"] = item.createdAt;
                result.append(jsonItem);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void SocialController::getAchievements(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    socialService_.getUserAchievements(db, userId,
        [callback](const std::vector<AchievementDto> &achievements) {
            Json::Value result(Json::arrayValue);
            for (const auto &a : achievements) {
                Json::Value item;
                item["id"] = a.id;
                item["name"] = a.name;
                item["displayName"] = a.displayName;
                item["description"] = a.description;
                item["icon"] = a.icon;
                item["earned"] = a.earned;
                item["earnedAt"] = a.earnedAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void SocialController::getReputation(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {

    int userId = std::stoi(id);
    auto db = drogon::app().getDbClient();

    socialService_.calculateReputation(db, userId,
        [callback](const ReputationDto &rep) {
            Json::Value result;
            result["total"] = rep.total;
            result["postCount"] = rep.postCount;
            result["upvoteCount"] = rep.upvoteCount;
            result["achievementCount"] = rep.achievementCount;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
