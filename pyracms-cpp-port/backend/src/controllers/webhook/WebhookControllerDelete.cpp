#include "controllers/WebhookController.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"

namespace pyracms {

void WebhookController::deleteWebhook(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {
    int webhookId = 0;
    if (!parseId(id, webhookId)) {
        callback(filterError("Webhook not found", drogon::k404NotFound));
        return;
    }
    webhookService_.deleteWebhook(
        drogon::app().getDbClient(), webhookId,
        [callback](bool success, const std::string &error) {
            if (!success) {
                callback(filterError(error, drogon::k404NotFound));
                return;
            }
            Json::Value result;
            result["message"] = "Webhook deleted";
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
