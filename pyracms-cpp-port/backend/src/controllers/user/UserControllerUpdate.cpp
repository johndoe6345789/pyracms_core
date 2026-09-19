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

} // namespace pyracms
