#include "services/DbError.h"
#include "services/WebhookService.h"

#include <memory>
#include <sstream>

namespace pyracms {

void WebhookService::updateWebhook(
    const DbClientPtr &db, int webhookId, const std::string &url,
    const std::optional<std::vector<std::string>> &events,
    const std::string &secret, const std::optional<bool> &active,
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
        url, eventsArray, secret, activeFlag, webhookId, events.has_value());
}

} // namespace pyracms
