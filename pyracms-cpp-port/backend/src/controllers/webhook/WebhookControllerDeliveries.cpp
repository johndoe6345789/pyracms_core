#include "controllers/WebhookController.h"
#include "filters/TenantGuard.h"
#include "filters/UserVisibility.h"
#include "security/Validate.h"

#include <sstream>

namespace pyracms {

static Json::Value deliveryJson(const WebhookDeliveryDto &d) {
    Json::Value item;
    item["id"] = d.id;
    item["webhookId"] = d.webhookId;
    item["event"] = d.event;
    item["statusCode"] = d.statusCode;
    item["responseBody"] = d.responseBody;
    item["deliveredAt"] = d.deliveredAt;
    Json::CharReaderBuilder readerBuilder;
    Json::Value payloadJson;
    std::istringstream payloadStream(d.payload);
    std::string errors;
    bool parsed = Json::parseFromStream(readerBuilder, payloadStream,
                                        &payloadJson, &errors);
    item["payload"] = parsed ? payloadJson : Json::Value(d.payload);
    return item;
}

void WebhookController::getDeliveries(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    const std::string &id) {
    int webhookId = 0;
    if (!parseId(id, webhookId)) {
        callback(filterError("Webhook not found", drogon::k404NotFound));
        return;
    }
    webhookService_.getDeliveries(
        drogon::app().getDbClient(), webhookId,
        clampLimit(req->getParameter("limit"), 20, 100),
        clampOffset(req->getParameter("offset")),
        [callback](const std::vector<WebhookDeliveryDto> &deliveries) {
            Json::Value result(Json::arrayValue);
            for (const auto &d : deliveries)
                result.append(deliveryJson(d));
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
