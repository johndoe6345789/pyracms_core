#include "security/SsrfGuard.h"
#include "services/WebhookService.h"

#include <drogon/HttpClient.h>

namespace pyracms {

// Defined in WebhookDelivery.cpp
void recordWebhookDelivery(const drogon::orm::DbClientPtr &db, int id,
                           const std::string &event,
                           const std::string &payload, int status,
                           std::string body);

void WebhookService::sendWebhook(const WebhookDto &webhook,
                                 const std::string &event,
                                 const Json::Value &payload,
                                 const std::string &payloadStr,
                                 const DbClientPtr &db, int retryCount) {
    static constexpr int MAX_RETRIES = 3;
    auto url = parseHttpUrl(webhook.url);
    if (!url.ok) {
        recordWebhookDelivery(db, webhook.id, event, payloadStr, 0, "Bad URL");
        return;
    }
    // HttpClient wants the origin; the URL's path/query goes on the request.
    auto httpClient = drogon::HttpClient::newHttpClient(url.origin);
    auto httpReq = drogon::HttpRequest::newHttpJsonRequest(payload);
    httpReq->setMethod(drogon::Post);
    httpReq->setPath(url.path);
    httpReq->addHeader("Content-Type", "application/json");
    httpReq->addHeader("X-Webhook-Event", event);
    if (!webhook.secret.empty()) {
        httpReq->addHeader("X-Webhook-Signature",
                           computeHmac(payloadStr, webhook.secret));
    }
    auto webhookCopy = webhook;
    httpClient->sendRequest(
        httpReq,
        [this, db, event, payloadStr, webhookCopy, payload, retryCount](
            drogon::ReqResult reqResult, const drogon::HttpResponsePtr &resp) {
            int statusCode = 0;
            std::string responseBody;
            if (reqResult == drogon::ReqResult::Ok && resp) {
                statusCode = static_cast<int>(resp->getStatusCode());
                responseBody = std::string(resp->getBody());
            } else {
                responseBody = "Connection failed";
            }
            recordWebhookDelivery(db, webhookCopy.id, event, payloadStr,
                                  statusCode,
                           responseBody);
            // Retry on failure with exponential backoff
            bool shouldRetry = (statusCode == 0 || statusCode >= 500) &&
                               retryCount < MAX_RETRIES;
            if (shouldRetry) {
                int delayMs = 1000 * (1 << retryCount); // 1s, 2s, 4s
                drogon::app().getLoop()->runAfter(
                    static_cast<double>(delayMs) / 1000.0,
                    [this, webhookCopy, event, payload, db, retryCount]() {
                        deliverWebhook(webhookCopy, event, payload, db,
                                       retryCount + 1);
                    });
            }
        },
        5.0); // 5 second timeout
}

} // namespace pyracms
