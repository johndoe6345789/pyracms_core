#include "security/SsrfGuard.h"
#include "services/DbError.h"
#include "services/WebhookService.h"

#include <chrono>
#include <drogon/HttpClient.h>
#include <thread>

namespace pyracms {

void recordWebhookDelivery(const drogon::orm::DbClientPtr &db, int webhookId,
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
                recordWebhookDelivery(db, webhook.id, event, payloadStr,
                                     0, "Blocked: " + why);
                return;
            }
            self->sendWebhook(webhook, event, payload, payloadStr, db,
                              retryCount);
        });
    }).detach();
}

} // namespace pyracms
