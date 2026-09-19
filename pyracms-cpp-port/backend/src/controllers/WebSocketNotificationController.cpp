#include "controllers/WebSocketNotificationController.h"

#include <drogon/drogon.h>
#include <json/json.h>
#include "controllers/WsAuth.h"

namespace pyracms {

std::mutex WebSocketNotificationController::connectionsMutex_;
std::unordered_map<int, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketNotificationController::userConnections_;
std::unordered_map<int, std::vector<drogon::WebSocketConnectionPtr>>
    WebSocketNotificationController::threadSubscriptions_;

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
    wsConnPtr->setContext(std::make_shared<WsIdentity>(
        WsIdentity{userId, who->tenantId}));

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

    auto ctx = wsConnPtr->getContext<WsIdentity>();
    if (!ctx) return;

    int userId = ctx->userId;

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

    auto ctx = wsConnPtr->getContext<WsIdentity>();
    if (!ctx || threadId <= 0) return;
    // The thread must live on the caller's own site (platform accounts,
    // tenant 0, may follow any). Answered asynchronously by the database.
    drogon::app().getDbClient()->execSqlAsync(
        "SELECT 1 FROM forum_threads t "
        "JOIN forums f ON f.id = t.forum_id "
        "JOIN forum_categories c ON c.id = f.category_id "
        "WHERE t.id = $1::int AND ($2::int = 0 OR c.tenant_id = $2::int)",
        [wsConnPtr, threadId](const drogon::orm::Result &r) {
            if (r.empty() || !wsConnPtr->connected()) return;
            std::lock_guard<std::mutex> lock(connectionsMutex_);
            auto &subs = threadSubscriptions_[threadId];
            if (subs.size() >= kMaxThreadSubscribers) return;
            subs.push_back(wsConnPtr);
            Json::Value ack;
            ack["type"] = "thread_subscribed";
            ack["threadId"] = threadId;
            Json::StreamWriterBuilder writer;
            wsConnPtr->send(Json::writeString(writer, ack));
        },
        [](const drogon::orm::DrogonDbException &) {}, threadId,
        ctx->tenantId);
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

    auto ctx = wsConnPtr->getContext<WsIdentity>();
    if (!ctx) return;
    int userId = ctx->userId;

    // Only members of a thread's audience may signal into it
    {
        std::lock_guard<std::mutex> lock(connectionsMutex_);
        auto subs = threadSubscriptions_.find(threadId);
        bool member = false;
        if (subs != threadSubscriptions_.end()) {
            for (auto &c : subs->second)
                member = member || c == wsConnPtr;
        }
        if (!member) return;
    }

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
