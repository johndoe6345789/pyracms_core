#include "controllers/WebSocketCollabController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

std::mutex WebSocketCollabController::roomsMutex_;

std::unordered_map<std::string, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketCollabController::rooms_;

} // namespace pyracms
