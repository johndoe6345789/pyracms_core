#include "controllers/AuthController.h"
#include "controllers/auth/AuthControllerInternal.h"

namespace pyracms {

void AuthController::oauthProviders(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    int userId = req->attributes()->get<int>("userId");
    auto db = drogon::app().getDbClient();

    oauthService_.getLinkedProviders(
        db, userId, [callback](const std::vector<OAuthLinkDto> &links) {
            Json::Value result(Json::arrayValue);
            for (const auto &link : links) {
                Json::Value item;
                item["id"] = link.id;
                item["provider"] = link.provider;
                item["providerUserId"] = link.providerUserId;
                item["email"] = link.email;
                item["displayName"] = link.displayName;
                item["createdAt"] = link.createdAt;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
