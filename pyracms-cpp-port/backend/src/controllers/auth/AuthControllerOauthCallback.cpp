#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "security/OAuthState.h"

#include <ctime>

namespace pyracms {

void AuthController::oauthCallback(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &provider) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["code"].isString()) {
        sendError(callback, "code is required", drogon::k400BadRequest);
        return;
    }
    if (!(*json)["state"].isString() ||
        !verifyOAuthState((*json)["state"].asString(), std::time(nullptr))) {
        sendError(callback, "Invalid or expired state",
                  drogon::k400BadRequest);
        return;
    }
    oauthService_.exchangeCode(
        provider, (*json)["code"].asString(),
        [this, provider, callback](const std::string &accessToken,
                                   const std::string &error) {
            if (!error.empty()) {
                sendError(callback, "OAuth sign-in failed",
                          drogon::k401Unauthorized);
                return;
            }
            oauthProfile(provider, accessToken, callback);
        });
}

} // namespace pyracms
