#include "services/WebhookEvents.h"
#include "services/WebhookService.h"

namespace pyracms {

void fireWebhookEvent(int tenantId, const std::string &event,
                      const Json::Value &data) {
    static WebhookService service;
    service.fireEvent(drogon::app().getDbClient(), tenantId, event, data);
}

void fireForumWebhookEvent(int threadId, const std::string &event,
                           Json::Value data) {
    drogon::app().getDbClient()->execSqlAsync(
        "SELECT c.tenant_id FROM forum_threads t "
        "JOIN forums f ON f.id = t.forum_id "
        "JOIN forum_categories c ON c.id = f.category_id WHERE t.id = $1",
        [event, data](const drogon::orm::Result &r) {
            if (!r.empty() && !r[0]["tenant_id"].isNull())
                fireWebhookEvent(r[0]["tenant_id"].as<int>(), event, data);
        },
        [](const drogon::orm::DrogonDbException &) {}, threadId);
}

void fireCommentCreated(int tenantId, const std::string &contentType,
                        int contentId, int userId, int commentId) {
    Json::Value d;
    d["commentId"] = commentId;
    d["contentType"] = contentType;
    d["contentId"] = contentId;
    d["userId"] = userId;
    fireWebhookEvent(tenantId, "comment.created", d);
}

} // namespace pyracms
