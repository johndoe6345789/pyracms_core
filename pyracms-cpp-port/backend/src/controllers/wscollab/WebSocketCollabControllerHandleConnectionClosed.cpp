#include "controllers/WebSocketCollabController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketCollabController::handleConnectionClosed(
    const drogon::WebSocketConnectionPtr &wsConnPtr) {

    auto ctx = wsConnPtr->getContext<ConnectionContext>();
    if (!ctx)
        return;

    std::lock_guard<std::mutex> lock(roomsMutex_);
    auto it = rooms_.find(ctx->room);
    if (it != rooms_.end()) {
        auto &conns = it->second;
        conns.erase(
            std::remove_if(
                conns.begin(), conns.end(),
                [&wsConnPtr](const drogon::WebSocketConnectionPtr &conn) {
                    return conn == wsConnPtr;
                }),
            conns.end());

        if (conns.empty()) {
            rooms_.erase(it);
        }
    }
}

} // namespace pyracms
