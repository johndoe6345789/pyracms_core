#include "security/NetPort.h"
#include "services/cache/WsRelay.h"

#include <chrono>
#include <thread>

namespace pyracms {

void WsRelay::start(const std::string &host, int port) {
    std::lock_guard<std::mutex> lock(mu_);
    if (started_)
        return;
    started_ = true;
    pool_ = std::make_unique<RedisPool>(host, port, 2);
    std::thread([this, host, port] { listen(host, port); }).detach();
}

// One SUBSCRIBE connection, re-made whenever it breaks. Waits without a
// read timeout (keepalive notices a dead peer), so an idle relay is free.
void WsRelay::listen(std::string host, int port) {
    for (;;) {
        int fd = RedisPool::dial(host, port);
        if (fd >= 0) {
            static const std::string sub =
                "*2\r\n$9\r\nSUBSCRIBE\r\n$10\r\npyracms:ws\r\n";
            if (::send(fd, sub.data(), sub.size(), 0) > 0) {
                netSetTimeoutMs(fd, 0);
                for (;;) {
                    auto r = readReply(fd);
                    if (!r.ok)
                        break;
                    if (r.kind == RespReply::Array && r.items.size() == 3 &&
                        r.items[0] == "message")
                        deliver(r.items[2]);
                }
            }
            netClose(fd);
        }
        std::this_thread::sleep_for(std::chrono::seconds(2));
    }
}

} // namespace pyracms
