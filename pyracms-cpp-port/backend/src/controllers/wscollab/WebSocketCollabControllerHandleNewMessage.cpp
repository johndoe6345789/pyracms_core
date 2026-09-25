#include "controllers/WebSocketCollabController.h"
#include "controllers/WsAuth.h"
#include "services/cache/WsRelay.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketCollabController::handleNewMessage(
    const drogon::WebSocketConnectionPtr &wsConnPtr, std::string &&message,
    const drogon::WebSocketMessageType &type) {

    auto ctx = wsConnPtr->getContext<ConnectionContext>();
    if (!ctx)
        return;

    if (message.size() > kMaxMessageBytes) {
        wsConnPtr->forceClose();
        return;
    }
    // Relay binary Yjs messages to all other connections in the same room
    if (type == drogon::WebSocketMessageType::Binary ||
        type == drogon::WebSocketMessageType::Text) {

        std::lock_guard<std::mutex> lock(roomsMutex_);
        auto it = rooms_.find(ctx->room);
        if (it != rooms_.end()) {
            for (auto &conn : it->second) {
                if (conn != wsConnPtr && conn->connected()) {
                    conn->send(message, type);
                }
            }
        }
    }

    // ...and to the connections other API processes hold for this room
    if (type != drogon::WebSocketMessageType::Ping)
        WsRelay::instance().publish(
            "collab", ctx->room, type == drogon::WebSocketMessageType::Binary,
            message);

    if (type == drogon::WebSocketMessageType::Ping) {
        wsConnPtr->send("", drogon::WebSocketMessageType::Pong);
    }
}

} // namespace pyracms
