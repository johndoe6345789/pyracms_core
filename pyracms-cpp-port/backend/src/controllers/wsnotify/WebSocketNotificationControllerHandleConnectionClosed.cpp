#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::handleConnectionClosed(
    const drogon::WebSocketConnectionPtr &wsConnPtr) {

    auto ctx = wsConnPtr->getContext<WsIdentity>();
    if (!ctx)
        return;

    int userId = ctx->userId;

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = userConnections_.find(userId);
    if (it != userConnections_.end()) {
        auto &conns = it->second;
        conns.erase(
            std::remove_if(
                conns.begin(), conns.end(),
                [&wsConnPtr](const drogon::WebSocketConnectionPtr &conn) {
                    return conn == wsConnPtr;
                }),
            conns.end());

        if (conns.empty()) {
            userConnections_.erase(it);
        }
    }

    // Clean up thread subscriptions
    for (auto &[threadId, subs] : threadSubscriptions_) {
        subs.erase(
            std::remove_if(
                subs.begin(), subs.end(),
                [&wsConnPtr](const drogon::WebSocketConnectionPtr &conn) {
                    return conn == wsConnPtr;
                }),
            subs.end());
    }
}

} // namespace pyracms
