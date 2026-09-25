#pragma once

#include <drogon/WebSocketController.h>
#include <mutex>
#include <unordered_map>

namespace pyracms {

class WebSocketCollabController
    : public drogon::WebSocketController<WebSocketCollabController> {
  public:
    WS_PATH_LIST_BEGIN
    WS_PATH_ADD("/api/ws/collab");
    WS_PATH_LIST_END

    void handleNewMessage(const drogon::WebSocketConnectionPtr &wsConnPtr,
                          std::string &&message,
                          const drogon::WebSocketMessageType &type) override;

    void handleNewConnection(
        const drogon::HttpRequestPtr &req,
        const drogon::WebSocketConnectionPtr &wsConnPtr) override;

    void handleConnectionClosed(
        const drogon::WebSocketConnectionPtr &wsConnPtr) override;

    // A message another API process received for `room`: hand it to the
    // connections held here.
    static void deliverRemote(const std::string &room, bool binary,
                              const std::string &payload);

  private:
    struct ConnectionContext {
        std::string room;
        int userId;
    };

    static std::mutex roomsMutex_;
    // room name -> connections in that room
    static std::unordered_map<std::string,
                              std::vector<drogon::WebSocketConnectionPtr>>
        rooms_;

    static constexpr size_t kMaxMessageBytes = 1024 * 1024;
};

} // namespace pyracms
