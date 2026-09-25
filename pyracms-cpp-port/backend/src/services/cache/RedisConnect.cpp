#include "services/cache/RedisPool.h"

#include "security/NetPort.h"

#ifndef _WIN32
#include <fcntl.h>
#include <netinet/tcp.h>
#include <poll.h>
#endif

namespace pyracms {

static constexpr int kIoMs = 500; // longest wait for Redis to answer

// Non-blocking connect bounded by kIoMs, then keepalive so a flow the
// overlay network forgot is noticed instead of hanging.
int RedisPool::dial(const std::string &host, int port) {
    struct addrinfo hints {
    }, *res = nullptr;
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;
    if (getaddrinfo(host.c_str(), std::to_string(port).c_str(), &hints,
                    &res) != 0)
        return -1;
    int fd = ::socket(res->ai_family, res->ai_socktype, res->ai_protocol);
    bool up = false;
    if (fd >= 0) {
#ifndef _WIN32
        fcntl(fd, F_SETFL, fcntl(fd, F_GETFL, 0) | O_NONBLOCK);
        int rc = ::connect(fd, res->ai_addr, res->ai_addrlen);
        struct pollfd p {
            fd, POLLOUT, 0
        };
        int err = 0;
        socklen_t len = sizeof err;
        up = (rc == 0) || (errno == EINPROGRESS && ::poll(&p, 1, kIoMs) == 1 &&
                           getsockopt(fd, SOL_SOCKET, SO_ERROR, &err, &len) ==
                               0 &&
                           err == 0);
        fcntl(fd, F_SETFL, fcntl(fd, F_GETFL, 0) & ~O_NONBLOCK);
        int on = 1, idle = 60, intvl = 15, cnt = 3;
        setsockopt(fd, SOL_SOCKET, SO_KEEPALIVE, &on, sizeof on);
        setsockopt(fd, IPPROTO_TCP, TCP_KEEPIDLE, &idle, sizeof idle);
        setsockopt(fd, IPPROTO_TCP, TCP_KEEPINTVL, &intvl, sizeof intvl);
        setsockopt(fd, IPPROTO_TCP, TCP_KEEPCNT, &cnt, sizeof cnt);
        setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, &on, sizeof on);
#else
        up = ::connect(fd, res->ai_addr,
                       static_cast<int>(res->ai_addrlen)) == 0;
#endif
        netSetTimeoutMs(fd, kIoMs);
    }
    freeaddrinfo(res);
    if (!up) {
        if (fd >= 0)
            netClose(fd);
        return -1;
    }
    return fd;
}

bool RedisPool::connect(Conn &c) {
    c.fd = dial(host_, port_);
    return c.fd >= 0;
}

} // namespace pyracms
