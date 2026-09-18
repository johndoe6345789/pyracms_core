#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::oauthUrl(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &provider) {

    auto state = req->getParameter("state");
    if (state.empty())
        state = "pyracms";

    auto url = oauthService_.getAuthorizationUrl(provider, state);
    if (url.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "Provider not configured: " + provider;
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    Json::Value result;
    result["url"] = url;
    result["provider"] = provider;
    callback(drogon::HttpResponse::newHttpJsonResponse(result));
}

} // namespace pyracms
