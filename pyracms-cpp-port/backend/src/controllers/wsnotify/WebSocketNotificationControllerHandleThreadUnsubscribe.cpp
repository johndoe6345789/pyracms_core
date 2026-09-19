#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::handleThreadUnsubscribe(
    const drogon::WebSocketConnectionPtr &wsConnPtr, int threadId) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = threadSubscriptions_.find(threadId);
    if (it != threadSubscriptions_.end()) {
        auto &subs = it->second;
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
