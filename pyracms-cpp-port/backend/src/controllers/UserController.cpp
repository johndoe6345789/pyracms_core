#include "controllers/UserController.h"
#include "filters/TenantGuard.h"
#include "security/RateLimiter.h"
#include "services/AuthService.h"

namespace pyracms {

// Update profile fields of the caller's own account.
void UserController::update(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {
    // Only allow users to update their own profile
    if (req->attributes()->get<int>("userId") != id) {
        callback(filterError("Forbidden", drogon::k403Forbidden));
        return;
    }
    auto json = req->getJsonObject();
    if (!json || !json->isObject()) {
        callback(filterError("Invalid JSON body", drogon::k400BadRequest));
        return;
    }
    userService_.updateUser(
        drogon::app().getDbClient(), id, *json,
        [callback](bool success, const std::string &error) {
            if (!success) {
                callback(filterError(error, drogon::k400BadRequest));
                return;
            }
            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

// Changing the password ends every older session; the reply carries a
// fresh token for this one.
void UserController::changePassword(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    int id) {
    auto requesterId = req->attributes()->get<int>("userId");
    if (requesterId != id) {
        callback(filterError("Forbidden", drogon::k403Forbidden));
        return;
    }
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["currentPassword"].isString() ||
        !(*json)["newPassword"].isString()) {
        callback(filterError("currentPassword and newPassword required",
                             drogon::k400BadRequest));
        return;
    }
    auto currentPassword = (*json)["currentPassword"].asString();
    auto newPassword = (*json)["newPassword"].asString();
    if (newPassword.length() < 8 ||
        newPassword.length() > AuthService::kMaxPasswordLen ||
        currentPassword.length() > AuthService::kMaxPasswordLen) {
        callback(filterError("New password must be 8-256 characters",
                             drogon::k400BadRequest));
        return;
    }
    auto key = "chpw|" + std::to_string(id);
    if (RateLimiter::enabled() &&
        RateLimiter::instance().locked(key, 5, 900)) {
        callback(filterError("Too many failed attempts, try later",
                             drogon::k429TooManyRequests));
        return;
    }
    auto db = drogon::app().getDbClient();
    auto username = req->attributes()->get<std::string>("username");
    auto tenant = req->attributes()->get<int>("tenantId");
    userService_.getPasswordHash(
        db, tenant, username,
        [this, db, id, username, tenant, key, currentPassword, newPassword,
         callback](const std::optional<std::string> &hash) {
            AuthService auth;
            if (!hash || !auth.verifyPassword(currentPassword, *hash)) {
                RateLimiter::instance().fail(key);
                callback(filterError("Current password is incorrect",
                                     drogon::k401Unauthorized));
                return;
            }
            RateLimiter::instance().succeed(key);
            userService_.updatePassword(
                db, id, auth.hashPassword(newPassword),
                [id, username, tenant, callback](bool ok,
                                                 const std::string &) {
                    if (!ok) {
                        callback(filterError("Failed to update password",
                                             drogon::k500InternalServerError));
                        return;
                    }
                    AuthService fresh;
                    Json::Value result;
                    result["success"] = true;
                    result["token"] = fresh.generateToken(id, username, tenant);
                    callback(drogon::HttpResponse::newHttpJsonResponse(result));
                });
        });
}

} // namespace pyracms
