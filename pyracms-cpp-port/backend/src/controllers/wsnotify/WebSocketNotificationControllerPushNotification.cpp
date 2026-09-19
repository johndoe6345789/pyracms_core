#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::pushNotification(
    int userId, const std::string &jsonPayload) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = userConnections_.find(userId);
    if (it != userConnections_.end()) {
        for (auto &conn : it->second) {
            if (conn->connected()) {
                conn->send(jsonPayload);
            }
        }
    }
}

} // namespace pyracms
