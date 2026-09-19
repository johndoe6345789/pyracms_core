#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "security/RateLimiter.h"

namespace pyracms {

// Account-level brake on top of the per-IP RateLimitFilter: guessing one
// account's password from many addresses still locks it.
static const int kMaxFails = 5;
static const int kLockSec = 900;

void AuthController::login(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["username"].isString() ||
        !(*json)["password"].isString()) {
        sendError(callback, "username and password required",
                  drogon::k400BadRequest);
        return;
    }
    auto username = (*json)["username"].asString();
    auto password = (*json)["password"].asString();
    if (username.size() > 64 ||
        password.size() > AuthService::kMaxPasswordLen) {
        sendError(callback, "Invalid credentials", drogon::k401Unauthorized);
        return;
    }

    withTenant(
        *json, callback,
        [this, username, password, callback](int tenantId,
                                             const std::string &slug) {
            auto key = "acct|" + std::to_string(tenantId) + "|" + username;
            auto &limiter = RateLimiter::instance();
            if (RateLimiter::enabled() &&
                limiter.locked(key, kMaxFails, kLockSec)) {
                sendError(callback, "Too many failed attempts, try later",
                          drogon::k429TooManyRequests);
                return;
            }
            auto db = drogon::app().getDbClient();
            userService_.getPasswordHash(
                db, tenantId, username,
                [this, db, tenantId, slug, username, password, key,
                 callback](const std::optional<std::string> &hash) {
                    if (!hash)
                        authService_.burnPasswordCheck(password);
                    if (!hash ||
                        !authService_.verifyPassword(password, *hash)) {
                        RateLimiter::instance().fail(key);
                        sendError(callback, "Invalid credentials",
                                  drogon::k401Unauthorized);
                        return;
                    }
                    RateLimiter::instance().succeed(key);
                    finishLogin(db, tenantId, slug, username, callback);
                });
        });
}

void AuthController::finishLogin(const drogon::orm::DbClientPtr &db,
                                 int tenantId, const std::string &slug,
                                 const std::string &username,
                                 HttpCb callback) {
    userService_.findByUsername(
        db, tenantId, username,
        [this, slug, callback](const std::optional<UserDto> &user) {
            if (!user) {
                sendError(callback, "Invalid credentials",
                          drogon::k401Unauthorized);
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
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
