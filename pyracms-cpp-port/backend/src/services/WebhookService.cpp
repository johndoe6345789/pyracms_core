#include "services/WebhookService.h"

#include <drogon/HttpClient.h>
#include <openssl/hmac.h>
#include <sstream>
#include <iomanip>
#include <thread>
#include <chrono>

namespace pyracms {

WebhookDto WebhookService::rowToDto(const drogon::orm::Row &row) {
    WebhookDto dto;
    dto.id = row["id"].as<int>();
    dto.tenantId = row["tenant_id"].as<int>();
    dto.url = row["url"].as<std::string>();
    dto.secret = row["secret"].isNull() ? "" : row["secret"].as<std::string>();
    dto.active = row["active"].as<bool>();
    dto.createdAt = row["created_at"].as<std::string>();

    // Parse the PostgreSQL text array for events
    auto eventsStr = row["events"].as<std::string>();
    // PostgreSQL arrays come as {val1,val2,...}
    if (eventsStr.size() > 2) {
        eventsStr = eventsStr.substr(1, eventsStr.size() - 2); // strip { }
        std::istringstream stream(eventsStr);
        std::string event;
        while (std::getline(stream, event, ',')) {
            // Remove any quotes
            if (!event.empty() && event.front() == '"') event = event.substr(1);
            if (!event.empty() && event.back() == '"') event.pop_back();
            if (!event.empty()) dto.events.push_back(event);
        }
    }

    return dto;
}

void WebhookService::listWebhooks(
    const DbClientPtr &db, int tenantId,
    std::function<void(const std::vector<WebhookDto> &)> cb) {

    db->execSqlAsync(
        "SELECT * FROM webhooks WHERE tenant_id = $1 ORDER BY created_at DESC",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<WebhookDto> webhooks;
            for (const auto &row : result) {
                webhooks.push_back(rowToDto(row));
            }
            cb(webhooks);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId);
}

void WebhookService::createWebhook(
    const DbClientPtr &db, int tenantId,
    const std::string &url,
    const std::vector<std::string> &events,
    const std::string &secret,
    std::function<void(bool success, int webhookId, const std::string &error)> cb) {

    // Build PostgreSQL array literal
    std::string eventsArray = "{";
    for (size_t i = 0; i < events.size(); i++) {
        if (i > 0) eventsArray += ",";
        eventsArray += "\"" + events[i] + "\"";
    }
    eventsArray += "}";

    db->execSqlAsync(
        "INSERT INTO webhooks (tenant_id, url, events, secret) "
        "VALUES ($1, $2, $3::text[], $4) RETURNING id",
        [cb](const drogon::orm::Result &result) {
            int newId = result[0]["id"].as<int>();
            cb(true, newId, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, e.base().what());
        },
        tenantId, url, eventsArray, secret);
}

void WebhookService::updateWebhook(
    const DbClientPtr &db, int webhookId,
    const std::string &url,
    const std::vector<std::string> &events,
    const std::string &secret,
    bool active,
    BoolCallback cb) {

    std::string eventsArray = "{";
    for (size_t i = 0; i < events.size(); i++) {
        if (i > 0) eventsArray += ",";
        eventsArray += "\"" + events[i] + "\"";
    }
    eventsArray += "}";

    db->execSqlAsync(
        "UPDATE webhooks SET url = $1, events = $2::text[], secret = $3, active = $4 "
        "WHERE id = $5",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Webhook not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        url, eventsArray, secret, active, webhookId);
}

void WebhookService::deleteWebhook(const DbClientPtr &db, int webhookId,
                                     BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM webhooks WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Webhook not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        webhookId);
}

void WebhookService::getDeliveries(
    const DbClientPtr &db, int webhookId, int limit, int offset,
    std::function<void(const std::vector<WebhookDeliveryDto> &)> cb) {

    db->execSqlAsync(
        "SELECT * FROM webhook_deliveries WHERE webhook_id = $1 "
        "ORDER BY delivered_at DESC LIMIT $2 OFFSET $3",
        [cb](const drogon::orm::Result &result) {
            std::vector<WebhookDeliveryDto> deliveries;
            for (const auto &row : result) {
                WebhookDeliveryDto dto;
                dto.id = row["id"].as<int>();
                dto.webhookId = row["webhook_id"].as<int>();
                dto.event = row["event"].as<std::string>();
                // payload is JSONB, read as string
                dto.payload = row["payload"].as<std::string>();
                dto.statusCode = row["status_code"].isNull() ? 0 : row["status_code"].as<int>();
                dto.responseBody = row["response_body"].isNull() ? "" : row["response_body"].as<std::string>();
                dto.deliveredAt = row["delivered_at"].as<std::string>();
                deliveries.push_back(dto);
            }
            cb(deliveries);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        webhookId, limit, offset);
}

std::string WebhookService::computeHmac(const std::string &payload,
                                          const std::string &secret) {
    unsigned char result[EVP_MAX_MD_SIZE];
    unsigned int resultLen = 0;

    HMAC(EVP_sha256(),
         secret.c_str(), static_cast<int>(secret.size()),
         reinterpret_cast<const unsigned char *>(payload.c_str()),
         payload.size(),
         result, &resultLen);

    std::ostringstream ss;
    for (unsigned int i = 0; i < resultLen; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << static_cast<int>(result[i]);
    }
    return "sha256=" + ss.str();
}

void WebhookService::fireEvent(
    const DbClientPtr &db, int tenantId,
    const std::string &event, const Json::Value &data) {

    // Find all active webhooks for this tenant that listen to this event
    db->execSqlAsync(
        "SELECT * FROM webhooks WHERE tenant_id = $1 AND active = TRUE "
        "AND $2 = ANY(events)",
        [this, event, data, db](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                auto webhook = rowToDto(row);
                Json::Value payload;
                payload["event"] = event;
                payload["timestamp"] = drogon::utils::getFormattedDate();
                payload["data"] = data;
                deliverWebhook(webhook, event, payload, db, 0);
            }
        },
        [](const drogon::orm::DrogonDbException &) {
            // Silently ignore webhook lookup failures
        },
        tenantId, event);
}

void WebhookService::deliverWebhook(
    const WebhookDto &webhook, const std::string &event,
    const Json::Value &payload, const DbClientPtr &db,
    int retryCount) {

    static constexpr int MAX_RETRIES = 3;

    Json::StreamWriterBuilder writer;
    std::string payloadStr = Json::writeString(writer, payload);

    auto httpClient = drogon::HttpClient::newHttpClient(webhook.url);
    httpClient->setSockOptCallback([](int) {});

    auto httpReq = drogon::HttpRequest::newHttpJsonRequest(payload);
    httpReq->setMethod(drogon::Post);
    httpReq->addHeader("Content-Type", "application/json");
    httpReq->addHeader("X-Webhook-Event", event);

    if (!webhook.secret.empty()) {
        auto signature = computeHmac(payloadStr, webhook.secret);
        httpReq->addHeader("X-Webhook-Signature", signature);
    }

    int webhookId = webhook.id;
    auto webhookCopy = webhook;

    httpClient->sendRequest(
        httpReq,
        [this, db, webhookId, event, payloadStr, webhookCopy, payload, retryCount]
        (drogon::ReqResult reqResult, const drogon::HttpResponsePtr &resp) {
            int statusCode = 0;
            std::string responseBody;

            if (reqResult == drogon::ReqResult::Ok && resp) {
                statusCode = static_cast<int>(resp->getStatusCode());
                responseBody = std::string(resp->getBody());
            } else {
                responseBody = "Connection failed";
            }

            // Record delivery
            db->execSqlAsync(
                "INSERT INTO webhook_deliveries (webhook_id, event, payload, status_code, response_body) "
                "VALUES ($1, $2, $3::jsonb, $4, $5)",
                [](const drogon::orm::Result &) {},
                [](const drogon::orm::DrogonDbException &) {},
                webhookId, event, payloadStr, statusCode, responseBody);

            // Retry on failure with exponential backoff
            bool shouldRetry = (statusCode == 0 || statusCode >= 500) && retryCount < MAX_RETRIES;
            if (shouldRetry) {
                int delayMs = 1000 * (1 << retryCount); // 1s, 2s, 4s
                drogon::app().getLoop()->runAfter(
                    static_cast<double>(delayMs) / 1000.0,
                    [this, webhookCopy, event, payload, db, retryCount]() {
                        deliverWebhook(webhookCopy, event, payload, db, retryCount + 1);
                    });
            }
        },
        5.0); // 5 second timeout
}

} // namespace pyracms
