#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::pushToThread(
    int threadId, const std::string &jsonPayload) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = threadSubscriptions_.find(threadId);
    if (it != threadSubscriptions_.end()) {
        for (auto &conn : it->second) {
            if (conn->connected()) {
                conn->send(jsonPayload);
            }
        }
    }
}

} // namespace pyracms
