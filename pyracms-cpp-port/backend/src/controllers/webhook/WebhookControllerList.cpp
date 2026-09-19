#include "controllers/WebhookController.h"
#include "filters/TenantGuard.h"

namespace pyracms {

// Secrets never leave the server; only administrators reach this route.
void WebhookController::listWebhooks(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {
    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        callback(filterError("tenant_id is required",
                             drogon::k400BadRequest));
        return;
    }
    webhookService_.listWebhooks(
        drogon::app().getDbClient(), std::stoi(tenantIdStr),
        [callback](const std::vector<WebhookDto> &webhooks) {
            Json::Value result(Json::arrayValue);
            for (const auto &w : webhooks) {
                Json::Value item;
                item["id"] = w.id;
                item["tenantId"] = w.tenantId;
                item["url"] = w.url;
                item["active"] = w.active;
                item["createdAt"] = w.createdAt;
                item["events"] = Json::Value(Json::arrayValue);
                for (const auto &e : w.events)
                    item["events"].append(e);
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
