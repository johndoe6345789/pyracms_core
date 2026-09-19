#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

std::mutex WebSocketNotificationController::connectionsMutex_;

std::unordered_map<int, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketNotificationController::userConnections_;

std::unordered_map<int, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketNotificationController::threadSubscriptions_;

} // namespace pyracms
