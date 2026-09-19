#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

std::unordered_set<int> WebSocketNotificationController::getOnlineUsers() {
    std::lock_guard<std::mutex> lock(connectionsMutex_);
    std::unordered_set<int> online;
    for (auto &[userId, conns] : userConnections_) {
        for (auto &conn : conns) {
            if (conn->connected()) {
                online.insert(userId);
                break;
            }
        }
    }
    return online;
}

} // namespace pyracms
