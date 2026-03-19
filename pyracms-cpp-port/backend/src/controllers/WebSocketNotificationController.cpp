#include "controllers/WebSocketNotificationController.h"

#include <drogon/drogon.h>
#include <json/json.h>
#include <jwt-cpp/traits/boost-json/defaults.h>

namespace pyracms {

std::mutex WebSocketNotificationController::connectionsMutex_;
std::unordered_map<int, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketNotificationController::userConnections_;
std::unordered_map<int, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketNotificationController::threadSubscriptions_;

int WebSocketNotificationController::authenticateFromToken(const std::string &token) {
    try {
        auto jwtSecret = drogon::app().getCustomConfig()["jwt_secret"].asString();
        if (jwtSecret.empty()) {
            jwtSecret = "change-me-in-production";
        }

        auto decoded = jwt::decode(token);
        auto verifier = jwt::verify()
            .allow_algorithm(jwt::algorithm::hs256{jwtSecret})
            .with_issuer("pyracms");
        verifier.verify(decoded);

        auto userIdClaim = decoded.get_payload_claim("userId");
        return userIdClaim.as_int();
    } catch (const std::exception &) {
        return -1;
    }
}

void WebSocketNotificationController::handleNewConnection(
    const drogon::HttpRequestPtr &req,
    const drogon::WebSocketConnectionPtr &wsConnPtr) {

    // Authenticate via JWT token in query parameter
    auto token = req->getParameter("token");
    if (token.empty()) {
        Json::Value errMsg;
        errMsg["error"] = "Authentication required. Pass ?token=<jwt>";
        Json::StreamWriterBuilder writer;
        wsConnPtr->send(Json::writeString(writer, errMsg));
        wsConnPtr->forceClose();
        return;
    }

    int userId = authenticateFromToken(token);
    if (userId < 0) {
        Json::Value errMsg;
        errMsg["error"] = "Invalid or expired token";
        Json::StreamWriterBuilder writer;
        wsConnPtr->send(Json::writeString(writer, errMsg));
        wsConnPtr->forceClose();
        return;
    }

    // Store user ID in connection context
    wsConnPtr->setContext(std::make_shared<int>(userId));

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

void WebSocketNotificationController::handleNewMessage(
    const drogon::WebSocketConnectionPtr &wsConnPtr,
    std::string &&message,
    const drogon::WebSocketMessageType &type) {

    if (type == drogon::WebSocketMessageType::Ping) {
        wsConnPtr->send("", drogon::WebSocketMessageType::Pong);
        return;
    }

    if (type != drogon::WebSocketMessageType::Text) {
        return;
    }

    // Parse incoming message
    Json::Value root;
    Json::CharReaderBuilder readerBuilder;
    std::istringstream stream(message);
    std::string errors;
    if (!Json::parseFromStream(readerBuilder, stream, &root, &errors)) {
        return;
    }

    auto msgType = root.isMember("type") ? root["type"].asString() : "";

    // Handle ping/pong keepalive from client
    if (msgType == "ping") {
        Json::Value pong;
        pong["type"] = "pong";
        Json::StreamWriterBuilder writer;
        wsConnPtr->send(Json::writeString(writer, pong));
    }
    // Thread subscription
    else if (msgType == "thread_subscribe" && root.isMember("threadId")) {
        handleThreadSubscribe(wsConnPtr, root["threadId"].asInt());
    }
    else if (msgType == "thread_unsubscribe" && root.isMember("threadId")) {
        handleThreadUnsubscribe(wsConnPtr, root["threadId"].asInt());
    }
    // Typing indicators
    else if (msgType == "typing_start" && root.isMember("threadId")) {
        handleTypingIndicator(wsConnPtr, root["threadId"].asInt(), true);
    }
    else if (msgType == "typing_stop" && root.isMember("threadId")) {
        handleTypingIndicator(wsConnPtr, root["threadId"].asInt(), false);
    }
}

void WebSocketNotificationController::handleConnectionClosed(
    const drogon::WebSocketConnectionPtr &wsConnPtr) {

    auto ctx = wsConnPtr->getContext<int>();
    if (!ctx) return;

    int userId = *ctx;

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = userConnections_.find(userId);
    if (it != userConnections_.end()) {
        auto &conns = it->second;
        conns.erase(
            std::remove_if(conns.begin(), conns.end(),
                [&wsConnPtr](const drogon::WebSocketConnectionPtr &conn) {
                    return conn == wsConnPtr;
                }),
            conns.end());

        if (conns.empty()) {
            userConnections_.erase(it);
        }
    }

    // Clean up thread subscriptions
    for (auto &[threadId, subs] : threadSubscriptions_) {
        subs.erase(
            std::remove_if(subs.begin(), subs.end(),
                [&wsConnPtr](const drogon::WebSocketConnectionPtr &conn) {
                    return conn == wsConnPtr;
                }),
            subs.end());
    }
}

void WebSocketNotificationController::pushNotification(
    int userId, const std::string &jsonPayload) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = userConnections_.find(userId);
    if (it != userConnections_.end()) {
        for (auto &conn : it->second) {
            if (conn->connected()) {
                conn->send(jsonPayload);
            }
        }
    }
}

void WebSocketNotificationController::broadcastNotification(
    const std::string &jsonPayload) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    for (auto &[userId, conns] : userConnections_) {
        for (auto &conn : conns) {
            if (conn->connected()) {
                conn->send(jsonPayload);
            }
        }
    }
}

void WebSocketNotificationController::pushToThread(
    int threadId, const std::string &jsonPayload) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = threadSubscriptions_.find(threadId);
    if (it != threadSubscriptions_.end()) {
        for (auto &conn : it->second) {
            if (conn->connected()) {
                conn->send(jsonPayload);
            }
        }
    }
}

void WebSocketNotificationController::handleThreadSubscribe(
    const drogon::WebSocketConnectionPtr &wsConnPtr, int threadId) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    threadSubscriptions_[threadId].push_back(wsConnPtr);

    Json::Value ack;
    ack["type"] = "thread_subscribed";
    ack["threadId"] = threadId;
    Json::StreamWriterBuilder writer;
    wsConnPtr->send(Json::writeString(writer, ack));
}

void WebSocketNotificationController::handleThreadUnsubscribe(
    const drogon::WebSocketConnectionPtr &wsConnPtr, int threadId) {

    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = threadSubscriptions_.find(threadId);
    if (it != threadSubscriptions_.end()) {
        auto &subs = it->second;
        subs.erase(
            std::remove_if(subs.begin(), subs.end(),
                [&wsConnPtr](const drogon::WebSocketConnectionPtr &conn) {
                    return conn == wsConnPtr;
                }),
            subs.end());
    }
}

void WebSocketNotificationController::handleTypingIndicator(
    const drogon::WebSocketConnectionPtr &wsConnPtr,
    int threadId, bool isTyping) {

    auto ctx = wsConnPtr->getContext<int>();
    if (!ctx) return;
    int userId = *ctx;

    Json::Value msg;
    msg["type"] = isTyping ? "typing_start" : "typing_stop";
    msg["threadId"] = threadId;
    msg["userId"] = userId;
    Json::StreamWriterBuilder writer;
    auto payload = Json::writeString(writer, msg);

    // Relay to all thread subscribers except the sender
    std::lock_guard<std::mutex> lock(connectionsMutex_);
    auto it = threadSubscriptions_.find(threadId);
    if (it != threadSubscriptions_.end()) {
        for (auto &conn : it->second) {
            if (conn != wsConnPtr && conn->connected()) {
                conn->send(payload);
            }
        }
    }
}

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
