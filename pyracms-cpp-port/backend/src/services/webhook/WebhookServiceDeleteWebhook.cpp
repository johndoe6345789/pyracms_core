#include "services/DbError.h"
#include "services/WebhookService.h"

#include <memory>
#include <sstream>

namespace pyracms {

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

} // namespace pyracms
