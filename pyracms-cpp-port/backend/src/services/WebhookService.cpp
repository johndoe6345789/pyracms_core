#include "services/WebhookService.h"
#include "services/DbError.h"

#include <memory>
#include <sstream>

namespace pyracms {

// Event names are validated (Validate.h isSafeKey) before they get here, so
// plain quoting is a well-formed PostgreSQL array literal.
std::string WebhookService::eventsLiteral(
    const std::vector<std::string> &events) {
    std::string out = "{";
    for (size_t i = 0; i < events.size(); i++) {
        if (i > 0) out += ",";
        out += "\"" + events[i] + "\"";
    }
    return out + "}";
}

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

    auto eventsArray = eventsLiteral(events);

    db->execSqlAsync(
        "INSERT INTO webhooks (tenant_id, url, events, secret) "
        "VALUES ($1, $2, $3::text[], $4) RETURNING id",
        [cb](const drogon::orm::Result &result) {
            int newId = result[0]["id"].as<int>();
            cb(true, newId, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, 0, dbError(e));
        },
        tenantId, url, eventsArray, secret);
}

void WebhookService::updateWebhook(
    const DbClientPtr &db, int webhookId,
    const std::string &url,
    const std::optional<std::vector<std::string>> &events,
    const std::string &secret,
    const std::optional<bool> &active,
    BoolCallback cb) {
    // A field that was not sent keeps its stored value.
    auto eventsArray = events ? eventsLiteral(*events) : std::string("{}");
    int activeFlag = active ? (*active ? 1 : 0) : -1;
    db->execSqlAsync(
        "UPDATE webhooks SET url = COALESCE(NULLIF($1::text, ''), url), "
        "events = CASE WHEN $6::bool THEN $2::text[] ELSE events END, "
        "secret = COALESCE(NULLIF($3::text, ''), secret), "
        "active = CASE WHEN $4::int < 0 THEN active ELSE $4::int = 1 END "
        "WHERE id = $5::int",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Webhook not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        url, eventsArray, secret, activeFlag, webhookId,
        events.has_value());
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
            cb(false, dbError(e));
        },
        webhookId);
}

void WebhookService::getDeliveries(
    const DbClientPtr &db, int webhookId, int limit, int offset,
    std::function<void(const std::vector<WebhookDeliveryDto> &)> cb) {

    db->execSqlAsync(
        "SELECT * FROM webhook_deliveries WHERE webhook_id = $1 "
        "ORDER BY delivered_at DESC LIMIT $2::int OFFSET $3::int",
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

} // namespace pyracms
