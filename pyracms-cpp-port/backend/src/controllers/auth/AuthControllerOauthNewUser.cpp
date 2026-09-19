#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "security/Validate.h"

namespace pyracms {

// First sign-in with this provider: create a platform account, link it.
void AuthController::oauthNewUser(const std::string &provider,
                                  const std::string &accessToken,
                                  const OAuthUserInfo &info, HttpCb callback) {
    auto db = drogon::app().getDbClient();
    auto hash = authService_.hashPassword(authService_.generateRandomToken());
    // Provider display names are free text: reduce to a valid username
    std::string name;
    for (unsigned char c : info.displayName)
        name += (std::isalnum(c) || c == '_' || c == '.' || c == '-')
                    ? static_cast<char>(c) : '_';
    if (name.size() > 32)
        name.resize(32);
    while (name.size() < 3)
        name += '_';
    if (!isValidEmail(info.email)) {
        sendError(callback, "The provider did not return a usable email",
                  drogon::k400BadRequest);
        return;
    }
    userService_.createUser(
        db, 0, name, info.displayName.substr(0, 128), info.email, hash,
        [this, db, provider, accessToken, info,
         name, callback](bool ok, const std::string &) {
            if (!ok) {
                sendError(callback, "Could not create the account",
                          drogon::k409Conflict);
                return;
            }
            userService_.findByUsername(
                db, 0, name,
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
