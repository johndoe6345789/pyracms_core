#include "controllers/WebSocketCollabController.h"

#include <drogon/drogon.h>
#include <json/json.h>
#include <jwt-cpp/jwt.h>

namespace pyracms {

std::mutex WebSocketCollabController::roomsMutex_;
std::unordered_map<std::string, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketCollabController::rooms_;

int WebSocketCollabController::authenticateFromToken(const std::string &token) {
    try {
        auto jwtSecret = drogon::app().getCustomConfig()["jwt_secret"].asString();
        if (jwtSecret.empty()) jwtSecret = "change-me-in-production";

        auto decoded = jwt::decode(token);
        auto verifier = jwt::verify()
            .allow_algorithm(jwt::algorithm::hs256{jwtSecret})
            .with_issuer("pyracms");
        verifier.verify(decoded);

        return decoded.get_payload_claim("userId").as_int();
    } catch (const std::exception &) {
        return -1;
    }
}

void WebSocketCollabController::handleNewConnection(
    const drogon::HttpRequestPtr &req,
    const drogon::WebSocketConnectionPtr &wsConnPtr) {

    auto token = req->getParameter("token");
    if (token.empty()) {
        wsConnPtr->forceClose();
        return;
    }

    int userId = authenticateFromToken(token);
    if (userId < 0) {
        wsConnPtr->forceClose();
        return;
    }

    auto room = req->getParameter("room");
    if (room.empty()) room = "default";

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
