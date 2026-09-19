#include "services/DbError.h"
#include "services/WebhookService.h"

#include <memory>
#include <sstream>

namespace pyracms {

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
                dto.statusCode = row["status_code"].isNull()
                                     ? 0
                                     : row["status_code"].as<int>();
                dto.responseBody = row["response_body"].isNull()
                                       ? ""
                                       : row["response_body"].as<std::string>();
                dto.deliveredAt = row["delivered_at"].as<std::string>();
                deliveries.push_back(dto);
            }
            cb(deliveries);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, webhookId,
        limit, offset);
}

} // namespace pyracms
