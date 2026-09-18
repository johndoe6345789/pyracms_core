#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Reply with a JWT for an account that is already linked.
void AuthController::oauthKnownUser(int userId, HttpCb callback) {
    userService_.findById(
        drogon::app().getDbClient(), userId,
        [this, callback](const std::optional<UserDto> &user) {
            if (!user) {
                sendError(callback, "User not found", drogon::k404NotFound);
                return;
            }
            Json::Value result;
            result["token"] = authService_.generateToken(
                user->id, user->username, user->tenantId);
            result["user"]["id"] = user->id;
            result["user"]["username"] = user->username;
            result["user"]["email"] = user->email;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
