#include "controllers/WebSocketCollabController.h"
#include "controllers/WebSocketNotificationController.h"
#include "services/CacheService.h"
#include "services/cache/WsRelay.h"
#include "startup/Startup.h"

namespace pyracms {

// With Redis, live WebSocket traffic crosses API processes (see WsRelay),
// which is what lets the API run as several replicas.
void startWsRelay() {
    if (!CacheService::instance().isConnected())
        return;
    auto &relay = WsRelay::instance();
    relay.on("collab", [](const std::string &room, bool binary,
                          const std::string &payload) {
        WebSocketCollabController::deliverRemote(room, binary, payload);
    });
    relay.on("thread", [](const std::string &key, bool,
                          const std::string &payload) {
        int thread = std::atoi(key.c_str());
        WebSocketNotificationController::pushToThread(thread, payload);
    });
    const char *host = std::getenv("REDIS_HOST");
    const char *port = std::getenv("REDIS_PORT");
    relay.start(host ? host : "127.0.0.1", port ? std::atoi(port) : 6379);
}

} // namespace pyracms
