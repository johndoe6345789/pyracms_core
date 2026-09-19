#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::broadcastNotification(
    const std::string &jsonPayload) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    for (auto &[userId, conns] : userConnections_) {
        for (auto &conn : conns) {
            if (conn->connected()) {
                conn->send(jsonPayload);
            }
        }
    }
}

} // namespace pyracms
