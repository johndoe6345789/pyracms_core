#pragma once

#include <drogon/WebSocketController.h>
#include <mutex>
#include <unordered_map>
#include <unordered_set>

namespace pyracms {

class WebSocketNotificationController
    : public drogon::WebSocketController<WebSocketNotificationController> {
public:
    WS_PATH_LIST_BEGIN
    WS_PATH_ADD("/api/ws/notifications");
    WS_PATH_LIST_END

    void handleNewMessage(const drogon::WebSocketConnectionPtr &wsConnPtr,
                          std::string &&message,
                          const drogon::WebSocketMessageType &type) override;

    void handleNewConnection(const drogon::HttpRequestPtr &req,
                             const drogon::WebSocketConnectionPtr &wsConnPtr) override;

    void handleConnectionClosed(const drogon::WebSocketConnectionPtr &wsConnPtr) override;

    // Static methods for pushing notifications from other services
    static void pushNotification(int userId, const std::string &jsonPayload);
    static void broadcastNotification(const std::string &jsonPayload);
    static std::unordered_set<int> getOnlineUsers();

private:
    static std::mutex connectionsMutex_;
    // userId -> set of WebSocket connections (user may have multiple tabs)
    static std::unordered_map<int, std::vector<drogon::WebSocketConnectionPtr>> userConnections_;

    int authenticateFromToken(const std::string &token);
};

} // namespace pyracms
