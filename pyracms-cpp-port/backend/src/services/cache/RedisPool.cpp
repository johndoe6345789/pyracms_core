#include "services/cache/RedisPool.h"

#include "security/NetPort.h"

#include <functional>
#include <thread>

namespace pyracms {

using Clock = std::chrono::steady_clock;

static constexpr auto kRetryAfter = std::chrono::seconds(2);
static constexpr auto kIdleRecycle = std::chrono::seconds(30);

RedisPool::RedisPool(std::string host, int port, size_t size)
    : host_(std::move(host)), port_(port) {
    netInit();
    for (size_t i = 0; i < size; ++i)
        conns_.push_back(std::make_unique<Conn>());
}

RedisPool::~RedisPool() {
    for (auto &c : conns_)
        drop(*c);
}

void RedisPool::drop(Conn &c) {
    if (c.fd >= 0)
        netClose(c.fd);
    c.fd = -1;
}

RespReply RedisPool::run(Conn &c, const std::vector<std::string> &args) {
    std::string cmd = "*" + std::to_string(args.size()) + "\r\n";
    for (const auto &a : args)
        cmd += "$" + std::to_string(a.size()) + "\r\n" + a + "\r\n";
    auto now = Clock::now();
    if (c.fd >= 0 && now - c.lastUse > kIdleRecycle)
        drop(c); // quiet connections are the ones that silently die
    for (int attempt = 0; attempt < 2; ++attempt) {
        bool fresh = c.fd < 0;
        if (fresh) {
            if (now < c.retryAt || !connect(c)) {
                c.retryAt = now + kRetryAfter;
                return {};
            }
        }
        if (::send(c.fd, cmd.data(), cmd.size(), 0) ==
            static_cast<SsizeT>(cmd.size())) {
            auto reply = readReply(c.fd);
            if (reply.ok) {
                c.lastUse = Clock::now();
                return reply;
            }
        }
        drop(c);
        if (fresh)
            break; // a brand new connection failed: Redis is unwell
    }
    c.retryAt = Clock::now() + kRetryAfter;
    return {};
}

RespReply RedisPool::command(const std::vector<std::string> &args) {
    size_t start = std::hash<std::thread::id>{}(std::this_thread::get_id()) %
                   conns_.size();
    for (size_t i = 0; i < conns_.size(); ++i) {
        auto &c = *conns_[(start + i) % conns_.size()];
        std::unique_lock<std::mutex> lock(c.mu, std::try_to_lock);
        if (lock.owns_lock())
            return run(c, args);
    }
    auto &c = *conns_[start];
    std::lock_guard<std::mutex> lock(c.mu);
    return run(c, args);
}

} // namespace pyracms
