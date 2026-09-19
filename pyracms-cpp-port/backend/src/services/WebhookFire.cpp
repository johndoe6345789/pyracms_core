#include "services/WebhookService.h"

#include <iomanip>
#include <openssl/hmac.h>
#include <sstream>

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

} // namespace pyracms
