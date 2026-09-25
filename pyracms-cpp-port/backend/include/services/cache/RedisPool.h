#pragma once

#include <chrono>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

namespace pyracms {

// One Redis reply. `ok` is false when the server could not be reached (or
// answered nonsense); an error reply from Redis is ok with kind Error.
struct RespReply {
    enum Kind { Nil, Error, Text, Integer, Array };
    bool ok = false;
    Kind kind = Nil;
    std::string text;
    long long number = 0;
    std::vector<std::string> items;
};

// A few connections to Redis, each used by one caller at a time, so cache
// calls from the server's many threads don't queue behind a single socket.
// Every call is bounded (short connect/read timeouts), a broken connection
// is replaced on the next call, and a Redis that is down costs one quick
// failure per couple of seconds rather than a stall per request.
class RedisPool {
  public:
    RedisPool(std::string host, int port, size_t size = 8);
    ~RedisPool();
    RespReply command(const std::vector<std::string> &args);
    // A connected socket (keepalive on, 500 ms timeouts) or -1.
    static int dial(const std::string &host, int port);

  private:
    struct Conn {
        std::mutex mu;
        int fd = -1;
        std::chrono::steady_clock::time_point retryAt{}, lastUse{};
    };
    RespReply run(Conn &c, const std::vector<std::string> &args);
    bool connect(Conn &c);
    static void drop(Conn &c);

    std::string host_;
    int port_;
    std::vector<std::unique_ptr<Conn>> conns_;
};

// Reads one complete reply from `fd` (exposed for tests of the parser).
RespReply readReply(int fd);

} // namespace pyracms
