#include "controllers/WebSocketCollabController.h"

namespace pyracms {

void WebSocketCollabController::deliverRemote(const std::string &room,
                                              bool binary,
                                              const std::string &payload) {
    std::lock_guard<std::mutex> lock(roomsMutex_);
    auto it = rooms_.find(room);
    if (it == rooms_.end())
        return;
    auto type = binary ? drogon::WebSocketMessageType::Binary
                       : drogon::WebSocketMessageType::Text;
    for (auto &conn : it->second)
        if (conn->connected())
            conn->send(payload, type);
}

} // namespace pyracms
