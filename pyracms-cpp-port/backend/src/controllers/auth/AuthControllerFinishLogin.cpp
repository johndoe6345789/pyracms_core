#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::finishLogin(const drogon::orm::DbClientPtr &db,
                                 int tenantId, const std::string &slug,
                                 const std::string &username, HttpCb callback) {
    userService_.findByUsername(
        db, tenantId, username,
        [this, slug, callback](const std::optional<UserDto> &user) {
            if (!user) {
                sendError(callback, "Invalid credentials",
                          drogon::k401Unauthorized);
                return;
            }
            if (user->banned) {
                sendError(callback, "Account is banned", drogon::k403Forbidden);
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
