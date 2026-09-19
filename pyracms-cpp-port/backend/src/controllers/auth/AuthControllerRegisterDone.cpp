#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Reload the new account (its role was decided by the INSERT), then reply.
void AuthController::registerDone(int tenantId, const std::string &slug,
                                  const std::string &username,
                                  bool firstUser, HttpCb callback) {
    auto db = drogon::app().getDbClient();
    userService_.findByUsername(
        db, tenantId, username, [=](const std::optional<UserDto> &user) {
            if (!user) {
                sendError(callback, "Registration failed",
                          drogon::k500InternalServerError);
                return;
            }
            Json::Value result;
            result["token"] = authService_.generateToken(
                user->id, user->username, user->tenantId);
            result["user"] = userJson(*user, slug);
            result["firstUser"] = firstUser;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
