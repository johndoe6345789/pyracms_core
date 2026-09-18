#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Step 2: fetch the provider profile, then log in or create the account.
void AuthController::oauthProfile(const std::string &provider,
                                  const std::string &accessToken,
                                  HttpCb callback) {
    oauthService_.getProviderProfile(
        provider, accessToken,
        [this, provider, accessToken,
         callback](const std::optional<OAuthUserInfo> &info) {
            if (!info) {
                sendError(callback, "Failed to get user profile",
                          drogon::k500InternalServerError);
                return;
            }
            oauthService_.findByProvider(
                drogon::app().getDbClient(), provider, info->providerId,
                [this, provider, accessToken, info,
                 callback](std::optional<int> userId) {
                    if (userId) {
                        oauthKnownUser(*userId, callback);
                    } else {
                        oauthNewUser(provider, accessToken, *info, callback);
                    }
                });
        });
}

} // namespace pyracms
