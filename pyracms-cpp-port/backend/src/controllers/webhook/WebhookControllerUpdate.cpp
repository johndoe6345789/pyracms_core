#include "controllers/WebhookController.h"
#include "controllers/WebhookInput.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// Access to webhook {id} was already decided by OwnerFilter.
void WebhookController::updateWebhook(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {
    auto json = req->getJsonObject();
    int webhookId = 0;
    if (!json || !parseId(id, webhookId)) {
        callback(filterError("JSON body required", drogon::k400BadRequest));
        return;
    }
    auto in = parseWebhookInput(*json, false);
    if (!in.problem.empty()) {
        callback(filterError(in.problem, drogon::k400BadRequest));
        return;
    }
    webhookService_.updateWebhook(
        drogon::app().getDbClient(), webhookId, in.url, in.events, in.secret,
        in.active, [callback](bool success, const std::string &error) {
            if (!success) {
                callback(filterError(error, drogon::k404NotFound));
                return;
            }
            Json::Value result;
            result["message"] = "Webhook updated";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
