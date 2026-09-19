#include "controllers/WebSocketCollabController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketCollabController::handleNewConnection(
    const drogon::HttpRequestPtr &req,
    const drogon::WebSocketConnectionPtr &wsConnPtr) {

    auto who = wsAuthenticate(req);
    if (!who) {
        wsConnPtr->forceClose();
        return;
    }
    int userId = who->userId;

    // Rooms live inside the caller's site: two sites can use the same room
    // name without ever seeing each other's edits.
    auto name = sanitizeRoom(req->getParameter("room"));
    if (name.empty() && !req->getParameter("room").empty()) {
        wsConnPtr->forceClose();
        return;
    }
    if (name.empty())
        name = "default";
    auto room = "t" + std::to_string(who->tenantId) + ":" + name;

    auto ctx = std::make_shared<ConnectionContext>();
    ctx->room = room;
    ctx->userId = userId;
    wsConnPtr->setContext(ctx);

    {
        std::lock_guard<std::mutex> lock(roomsMutex_);
        rooms_[room].push_back(wsConnPtr);
    }

    Json::Value welcome;
    welcome["type"] = "collab_connected";
    welcome["room"] = room;
    welcome["userId"] = userId;
    Json::StreamWriterBuilder writer;
    wsConnPtr->send(Json::writeString(writer, welcome));
}

} // namespace pyracms
