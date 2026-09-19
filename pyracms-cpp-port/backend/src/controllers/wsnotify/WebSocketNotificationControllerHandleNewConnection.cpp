#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::handleNewConnection(
    const drogon::HttpRequestPtr &req,
    const drogon::WebSocketConnectionPtr &wsConnPtr) {

    auto who = wsAuthenticate(req);
    if (!who) {
        Json::Value errMsg;
        errMsg["error"] = "Authentication required or token invalid";
        Json::StreamWriterBuilder writer;
        wsConnPtr->send(Json::writeString(writer, errMsg));
        wsConnPtr->forceClose();
        return;
    }
    int userId = who->userId;

    // Remember who this is (and which site) for later messages
    wsConnPtr->setContext(
        std::make_shared<WsIdentity>(WsIdentity{userId, who->tenantId}));

    {
        std::lock_guard<std::mutex> lock(connectionsMutex_);
        userConnections_[userId].push_back(wsConnPtr);
    }

    // Send welcome message
    Json::Value welcome;
    welcome["type"] = "connected";
    welcome["userId"] = userId;
    welcome["message"] = "WebSocket connection established";
    Json::StreamWriterBuilder writer;
    wsConnPtr->send(Json::writeString(writer, welcome));
}

} // namespace pyracms
