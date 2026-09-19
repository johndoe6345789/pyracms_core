#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"
#include "security/OAuthState.h"

#include <ctime>

namespace pyracms {

void AuthController::oauthUrl(
    const drogon::HttpRequestPtr &/*req*/,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &provider) {

    // Server-minted anti-forgery state; the callback verifies it.
    auto state = makeOAuthState(std::time(nullptr));

    auto url = oauthService_.getAuthorizationUrl(provider, state);
    if (url.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Provider not configured";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    Json::Value result;
    result["url"] = url;
    result["state"] = state;
    result["provider"] = provider;
    callback(drogon::HttpResponse::newHttpJsonResponse(result));
}

} // namespace pyracms
