#include "controllers/WebhookController.h"
#include "controllers/WebhookInput.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void WebhookController::createWebhook(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !json->isMember("tenant_id") ||
        !(*json)["tenant_id"].isInt()) {
        callback(filterError("url, events, and tenant_id required",
                             drogon::k400BadRequest));
        return;
    }
    auto in = parseWebhookInput(*json, true);
    if (!in.problem.empty()) {
        callback(filterError(in.problem, drogon::k400BadRequest));
        return;
    }
    webhookService_.createWebhook(
        drogon::app().getDbClient(), (*json)["tenant_id"].asInt(), in.url,
        *in.events, in.secret,
        [callback](bool success, int webhookId, const std::string &error) {
            if (!success) {
                callback(filterError(error, drogon::k400BadRequest));
                return;
            }
            Json::Value result;
            result["message"] = "Webhook created";
            result["id"] = webhookId;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

} // namespace pyracms
