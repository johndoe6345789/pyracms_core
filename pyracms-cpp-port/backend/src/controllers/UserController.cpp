#include "controllers/UserController.h"
#include "services/AuthService.h"

namespace pyracms {

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
    auto requesterTenant = req->attributes()->get<int>("tenantId");
    userService_.getPasswordHash(
        db, requesterTenant, requesterUsername,
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
