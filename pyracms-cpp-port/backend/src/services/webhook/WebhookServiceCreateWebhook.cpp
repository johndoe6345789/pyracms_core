#include "services/DbError.h"
#include "services/WebhookService.h"

#include <memory>
#include <sstream>

namespace pyracms {

void WebhookService::createWebhook(
    const DbClientPtr &db, int tenantId, const std::string &url,
    const std::vector<std::string> &events, const std::string &secret,
    std::function<void(bool success, int webhookId, const std::string &error)>
        cb) {

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

} // namespace pyracms
