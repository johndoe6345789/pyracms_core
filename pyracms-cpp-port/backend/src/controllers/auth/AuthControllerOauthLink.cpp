#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::oauthLink(const UserDto &user, const std::string &provider,
                               const std::string &accessToken,
                               const OAuthUserInfo &info, HttpCb callback) {
    oauthService_.linkAccount(
        drogon::app().getDbClient(), user.id, provider, info, accessToken,
        [this, user, callback](bool ok, const std::string &) {
            if (!ok) {
                sendError(callback, "Could not link the account",
                          drogon::k500InternalServerError);
                return;
            }
            Json::Value result;
            result["token"] = authService_.generateToken(user.id, user.username,
                                                         user.tenantId);
            result["user"]["id"] = user.id;
            result["user"]["username"] = user.username;
            result["user"]["email"] = user.email;
            result["created"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
