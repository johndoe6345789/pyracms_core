#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Reload the new account, promote it if first in its scope, then reply.
void AuthController::registerDone(int tenantId, const std::string &slug,
                                  const std::string &username, int count,
                                  HttpCb callback) {
    auto db = drogon::app().getDbClient();
    userService_.findByUsername(
        db, tenantId, username, [=](const std::optional<UserDto> &user) {
            if (!user) {
                sendError(callback, "Registration failed",
                          drogon::k500InternalServerError);
                return;
            }
            UserDto u = *user;
            if (count == 0) {
                // The first account of a scope owns it
                u.role =
                    slug.empty() ? UserRole::SuperAdmin : UserRole::SiteAdmin;
                userService_.setUserRole(db, u.id, u.role,
                                         [](bool, const std::string &) {});
            }
            Json::Value result;
            result["token"] =
                authService_.generateToken(u.id, u.username, u.tenantId);
            result["user"] = userJson(u, slug);
            result["firstUser"] = (count == 0);
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
