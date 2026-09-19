#include "services/DbError.h"
#include "services/WebhookService.h"

#include <memory>
#include <sstream>

namespace pyracms {

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
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId);
}

} // namespace pyracms
