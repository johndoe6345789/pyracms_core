#include "controllers/WebSocketNotificationController.h"
#include "controllers/WsAuth.h"

#include <drogon/drogon.h>
#include <json/json.h>

namespace pyracms {

void WebSocketNotificationController::handleNewMessage(
    const drogon::WebSocketConnectionPtr &wsConnPtr, std::string &&message,
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
    } else if (msgType == "thread_unsubscribe" && root.isMember("threadId")) {
        handleThreadUnsubscribe(wsConnPtr, root["threadId"].asInt());
    }
    // Typing indicators
    else if (msgType == "typing_start" && root.isMember("threadId")) {
        handleTypingIndicator(wsConnPtr, root["threadId"].asInt(), true);
    } else if (msgType == "typing_stop" && root.isMember("threadId")) {
        handleTypingIndicator(wsConnPtr, root["threadId"].asInt(), false);
    }
}

} // namespace pyracms
