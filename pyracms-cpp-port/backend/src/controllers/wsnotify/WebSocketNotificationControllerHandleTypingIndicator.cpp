#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::handleTypingIndicator(
    const drogon::WebSocketConnectionPtr &wsConnPtr, int threadId,
    bool isTyping) {

    auto ctx = wsConnPtr->getContext<WsIdentity>();
    if (!ctx)
        return;
    int userId = ctx->userId;

    // Only members of a thread's audience may signal into it
    {
        std::lock_guard<std::mutex> lock(connectionsMutex_);
        auto subs = threadSubscriptions_.find(threadId);
        bool member = false;
        if (subs != threadSubscriptions_.end()) {
            for (auto &c : subs->second)
                member = member || c == wsConnPtr;
        }
        if (!member)
            return;
    }

    Json::Value msg;
    msg["type"] = isTyping ? "typing_start" : "typing_stop";
    msg["threadId"] = threadId;
    msg["userId"] = userId;
    Json::StreamWriterBuilder writer;
    auto payload = Json::writeString(writer, msg);

    // Relay to all thread subscribers except the sender
    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = threadSubscriptions_.find(threadId);
    if (it != threadSubscriptions_.end()) {
        for (auto &conn : it->second) {
            if (conn != wsConnPtr && conn->connected()) {
                conn->send(payload);
            }
        }
    }
}

} // namespace pyracms
