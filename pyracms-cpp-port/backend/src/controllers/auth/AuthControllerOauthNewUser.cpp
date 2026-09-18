#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// First sign-in with this provider: create a platform account, link it.
void AuthController::oauthNewUser(const std::string &provider,
                                  const std::string &accessToken,
                                  const OAuthUserInfo &info, HttpCb callback) {
    auto db = drogon::app().getDbClient();
    auto hash = authService_.hashPassword(authService_.generateRandomToken());
    userService_.createUser(
        db, 0, info.displayName, info.displayName, info.email, hash,
        [this, db, provider, accessToken, info,
         callback](bool ok, const std::string &error) {
            if (!ok) {
                sendError(callback, error, drogon::k409Conflict);
                return;
            }
            userService_.findByUsername(
                db, 0, info.displayName,
                [this, provider, accessToken, info,
                 callback](const std::optional<UserDto> &user) {
                    if (!user) {
                        sendError(callback, "Failed to find created user",
                                  drogon::k500InternalServerError);
                        return;
                    }
                    oauthLink(*user, provider, accessToken, info, callback);
                });
        });
}

} // namespace pyracms
