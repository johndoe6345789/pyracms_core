#include "controllers/WebSocketCollabController.h"

#include <drogon/drogon.h>
#include <json/json.h>
#include "controllers/WsAuth.h"

namespace pyracms {

std::mutex WebSocketCollabController::roomsMutex_;
std::unordered_map<std::string, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketCollabController::rooms_;

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
    if (name.empty()) name = "default";
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

void WebSocketCollabController::handleNewMessage(
    const drogon::WebSocketConnectionPtr &wsConnPtr,
    std::string &&message,
    const drogon::WebSocketMessageType &type) {

    auto ctx = wsConnPtr->getContext<ConnectionContext>();
    if (!ctx) return;

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

    if (type == drogon::WebSocketMessageType::Ping) {
        wsConnPtr->send("", drogon::WebSocketMessageType::Pong);
    }
}

void WebSocketCollabController::handleConnectionClosed(
    const drogon::WebSocketConnectionPtr &wsConnPtr) {

    auto ctx = wsConnPtr->getContext<ConnectionContext>();
    if (!ctx) return;

    std::lock_guard<std::mutex> lock(roomsMutex_);
    auto it = rooms_.find(ctx->room);
    if (it != rooms_.end()) {
        auto &conns = it->second;
        conns.erase(
            std::remove_if(conns.begin(), conns.end(),
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
