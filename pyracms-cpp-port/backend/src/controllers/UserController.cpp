#include "controllers/UserController.h"
#include "services/AuthService.h"

namespace pyracms {

void UserController::list(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto limitStr = req->getParameter("limit");
    auto offsetStr = req->getParameter("offset");
    int limit = limitStr.empty() ? 50 : std::stoi(limitStr);
    int offset = offsetStr.empty() ? 0 : std::stoi(offsetStr);

    auto db = drogon::app().getDbClient();
    userService_.listUsers(
        db, limit, offset,
        [callback](const std::vector<UserDto> &users) {
            Json::Value result(Json::arrayValue);
            for (const auto &u : users) {
                Json::Value item;
                item["id"] = u.id;
                item["username"] = u.username;
                item["fullName"] = u.fullName;
                item["email"] = u.email;
                item["createdAt"] = u.createdAt;
                item["banned"] = u.banned;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void UserController::getById(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto db = drogon::app().getDbClient();
    userService_.findById(
        db, id,
        [callback](const std::optional<UserDto> &user) {
            if (!user) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "User not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = user->id;
            result["username"] = user->username;
            result["fullName"] = user->fullName;
            result["email"] = user->email;
            result["website"] = user->website;
            result["aboutme"] = user->aboutme;
            result["timezone"] = user->timezone;
            result["banned"] = user->banned;
            result["createdAt"] = user->createdAt;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void UserController::update(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    // Only allow users to update their own profile
    auto requesterId = req->attributes()->get<int>("userId");
    if (requesterId != id) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Forbidden";
        resp->setStatusCode(drogon::k403Forbidden);
        callback(resp);
        return;
    }

    auto json = req->getJsonObject();
    if (!json) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Invalid JSON body";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto db = drogon::app().getDbClient();
    userService_.updateUser(
        db, id, *json,
        [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k400BadRequest);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

void UserController::changePassword(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {

    auto requesterId = req->attributes()->get<int>("userId");
    if (requesterId != id) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Forbidden";
        resp->setStatusCode(drogon::k403Forbidden);
        callback(resp);
        return;
    }

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("currentPassword") ||
        !(*json).isMember("newPassword")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "currentPassword and newPassword required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto currentPassword = (*json)["currentPassword"].asString();
    auto newPassword = (*json)["newPassword"].asString();

    if (newPassword.length() < 8) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "New password must be at least 8 characters";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto db = drogon::app().getDbClient();
    auto requesterUsername = req->attributes()->get<std::string>("username");

    AuthService authService;
    userService_.getPasswordHash(
        db, requesterUsername,
        [this, db, id, currentPassword, newPassword, authService, callback](
            const std::optional<std::string> &hash) mutable {
            if (!hash || !authService.verifyPassword(currentPassword, *hash)) {
                auto resp = drogon::HttpResponse::newHttpJsonResponse(
                    Json::Value{});
                (*resp->jsonObject())["error"] = "Current password is incorrect";
                resp->setStatusCode(drogon::k401Unauthorized);
                callback(resp);
                return;
            }

            auto newHash = authService.hashPassword(newPassword);
            userService_.updatePassword(
                db, id, newHash,
                [callback](bool success, const std::string &error) {
                    if (!success) {
                        auto resp =
                            drogon::HttpResponse::newHttpJsonResponse(
                                Json::Value{});
                        (*resp->jsonObject())["error"] = error;
                        resp->setStatusCode(drogon::k500InternalServerError);
                        callback(resp);
                        return;
                    }

                    Json::Value result;
                    result["success"] = true;
                    callback(
                        drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
