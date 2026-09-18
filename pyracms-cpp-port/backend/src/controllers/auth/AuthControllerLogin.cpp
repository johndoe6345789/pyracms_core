#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::login(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("username") ||
        !(*json).isMember("password")) {
        sendError(callback, "username and password required",
                  drogon::k400BadRequest);
        return;
    }

    auto username = (*json)["username"].asString();
    auto password = (*json)["password"].asString();

    withTenant(
        *json, callback,
        [this, username, password, callback](int tenantId,
                                             const std::string &slug) {
            auto db = drogon::app().getDbClient();
            userService_.getPasswordHash(
                db, tenantId, username,
                [this, db, tenantId, slug, username, password,
                 callback](const std::optional<std::string> &hash) {
                    if (!hash ||
                        !authService_.verifyPassword(password, *hash)) {
                        sendError(callback, "Invalid credentials",
                                  drogon::k401Unauthorized);
                        return;
                    }
                    userService_.findByUsername(
                        db, tenantId, username,
                        [this, slug,
                         callback](const std::optional<UserDto> &user) {
                            if (!user) {
                                sendError(callback, "User not found",
                                          drogon::k404NotFound);
                                return;
                            }
                            if (user->banned) {
                                sendError(callback, "Account is banned",
                                          drogon::k403Forbidden);
                                return;
                            }
                            Json::Value result;
                            result["token"] = authService_.generateToken(
                                user->id, user->username, user->tenantId);
                            result["user"] = userJson(*user, slug);
                            callback(drogon::HttpResponse::newHttpJsonResponse(
                                result));
                        });
                });
        });
}

} // namespace pyracms
