#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

// Step 2: fetch the provider profile and sign in the linked account. A
// provider never creates an account: people sign up on a site, and the
// platform account comes from first-run setup.
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
                    if (userId)
                        return oauthKnownUser(*userId, callback);
                    sendError(callback,
                              "No account is linked to this provider yet",
                              drogon::k403Forbidden);
                });
        });
}

} // namespace pyracms
