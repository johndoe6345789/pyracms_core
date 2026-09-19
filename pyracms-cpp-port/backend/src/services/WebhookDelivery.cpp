#include "security/SsrfGuard.h"
#include "services/DbError.h"
#include "services/WebhookService.h"

#include <chrono>
#include <drogon/HttpClient.h>
#include <iomanip>
#include <openssl/hmac.h>
#include <sstream>
#include <thread>

namespace pyracms {

std::string WebhookService::computeHmac(const std::string &payload,
                                        const std::string &secret) {
    unsigned char result[EVP_MAX_MD_SIZE];
    unsigned int resultLen = 0;
    HMAC(EVP_sha256(), secret.c_str(), static_cast<int>(secret.size()),
         reinterpret_cast<const unsigned char *>(payload.c_str()),
         payload.size(), result, &resultLen);
    std::ostringstream ss;
    for (unsigned int i = 0; i < resultLen; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0')
           << static_cast<int>(result[i]);
    }
    return "sha256=" + ss.str();
}

void WebhookService::fireEvent(const DbClientPtr &db, int tenantId,
                               const std::string &event,
                               const Json::Value &data) {
    // Find all active webhooks for this tenant that listen to this event
    db->execSqlAsync(
        "SELECT * FROM webhooks WHERE tenant_id = $1 AND active = TRUE "
        "AND $2 = ANY(events)",
        [this, event, data, db](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                auto webhook = rowToDto(row);
                Json::Value payload;
                payload["event"] = event;
                payload["timestamp"] =
                    trantor::Date::now().toFormattedString(false);
                payload["data"] = data;
                deliverWebhook(webhook, event, payload, db, 0);
            }
        },
        [](const drogon::orm::DrogonDbException &) {
            // Silently ignore webhook lookup failures
        },
        tenantId, event);
}

static void recordDelivery(const drogon::orm::DbClientPtr &db, int webhookId,
                           const std::string &event,
                           const std::string &payloadStr, int statusCode,
                           std::string body) {
    if (body.size() > WebhookService::kMaxLoggedBody)
        body.resize(WebhookService::kMaxLoggedBody);
    db->execSqlAsync(
        "INSERT INTO webhook_deliveries (webhook_id, event, payload, "
        "status_code, response_body) VALUES ($1, $2, $3::jsonb, $4, $5)",
        [](const drogon::orm::Result &) {},
        [](const drogon::orm::DrogonDbException &) {}, webhookId, event,
        payloadStr, statusCode, body);
}

// The address check runs on a worker thread (DNS can block) immediately
// before every attempt, so a hostname that later turns into an internal
// address (DNS rebinding between attempts) is caught on the next try.
void WebhookService::deliverWebhook(const WebhookDto &webhook,
                                    const std::string &event,
                                    const Json::Value &payload,
                                    const DbClientPtr &db, int retryCount) {
    Json::StreamWriterBuilder writer;
    std::string payloadStr = Json::writeString(writer, payload);
    auto loop = drogon::app().getLoop();
    auto self = this;
    std::thread([=]() {
        auto why = checkOutboundUrl(webhook.url);
        loop->queueInLoop([=]() {
            if (!why.empty()) {
                recordDelivery(db, webhook.id, event, payloadStr, 0,
                               "Blocked: " + why);
                return;
            }
            self->sendWebhook(webhook, event, payload, payloadStr, db,
                              retryCount);
        });
    }).detach();
}

void WebhookService::sendWebhook(const WebhookDto &webhook,
                                 const std::string &event,
                                 const Json::Value &payload,
                                 const std::string &payloadStr,
                                 const DbClientPtr &db, int retryCount) {
    static constexpr int MAX_RETRIES = 3;
    auto url = parseHttpUrl(webhook.url);
    if (!url.ok) {
        recordDelivery(db, webhook.id, event, payloadStr, 0, "Bad URL");
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
            recordDelivery(db, webhookCopy.id, event, payloadStr, statusCode,
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
