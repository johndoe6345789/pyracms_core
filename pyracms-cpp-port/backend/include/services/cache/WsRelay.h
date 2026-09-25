#pragma once

#include "services/cache/RedisPool.h"

#include <functional>
#include <map>
#include <memory>
#include <mutex>
#include <string>

namespace pyracms {

// Carries live WebSocket traffic between API processes through Redis
// pub/sub, so that people connected to different replicas still see each
// other (typing indicators, thread updates, collaborative editing). Each
// controller delivers to its own connections as before and also publishes;
// every other process delivers the message to its local connections.
// Without Redis nothing changes: one process, local delivery only.
class WsRelay {
  public:
    using Handler = std::function<void(
        const std::string &key, bool binary, const std::string &payload)>;

    static WsRelay &instance();
    // Reads REDIS_HOST/REDIS_PORT; starts the listener thread. Idempotent.
    void start(const std::string &host, int port);
    void on(const std::string &kind, Handler h);
    void publish(const std::string &kind, const std::string &key, bool binary,
                 const std::string &payload);

    // The wire format (public so it can be tested).
    static std::string pack(const std::string &node, const std::string &kind,
                            const std::string &key, bool binary,
                            const std::string &payload);
    // Delivers a packed message unless it came from this process.
    void deliver(const std::string &msg);

  private:
    WsRelay();
    void listen(std::string host, int port);

    std::string node_;
    std::unique_ptr<RedisPool> pool_;
    std::mutex mu_;
    std::map<std::string, Handler> handlers_;
    bool started_ = false;
};

} // namespace pyracms
