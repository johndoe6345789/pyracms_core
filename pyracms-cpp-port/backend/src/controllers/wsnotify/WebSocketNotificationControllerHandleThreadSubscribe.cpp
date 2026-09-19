#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::handleThreadSubscribe(
    const drogon::WebSocketConnectionPtr &wsConnPtr, int threadId) {

    auto ctx = wsConnPtr->getContext<WsIdentity>();
    if (!ctx || threadId <= 0)
        return;
    // The thread must live on the caller's own site (platform accounts,
    // tenant 0, may follow any). Answered asynchronously by the database.
    drogon::app().getDbClient()->execSqlAsync(
        "SELECT 1 FROM forum_threads t "
        "JOIN forums f ON f.id = t.forum_id "
        "JOIN forum_categories c ON c.id = f.category_id "
        "WHERE t.id = $1::int AND ($2::int = 0 OR c.tenant_id = $2::int)",
        [wsConnPtr, threadId](const drogon::orm::Result &r) {
            if (r.empty() || !wsConnPtr->connected())
                return;
            std::lock_guard<std::mutex> lock(connectionsMutex_);
            auto &subs = threadSubscriptions_[threadId];
            if (subs.size() >= kMaxThreadSubscribers)
                return;
            subs.push_back(wsConnPtr);
            Json::Value ack;
            ack["type"] = "thread_subscribed";
            ack["threadId"] = threadId;
            Json::StreamWriterBuilder writer;
            wsConnPtr->send(Json::writeString(writer, ack));
        },
        [](const drogon::orm::DrogonDbException &) {}, threadId, ctx->tenantId);
}

} // namespace pyracms
