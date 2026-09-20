#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

void CacheService::reconnect() {
    netInit();
    std::lock_guard<std::mutex> lock(mutex_);
    ctx_ = std::make_unique<RedisContext>();

    struct addrinfo hints {
    }, *res;
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;

    if (getaddrinfo(host_.c_str(), std::to_string(port_).c_str(), &hints,
                    &res) != 0) {
        connected_ = false;
        return;
    }

    int fd = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
    if (fd < 0) {
        freeaddrinfo(res);
        connected_ = false;
        return;
    }

    // Set timeout
    netSetTimeout(fd, 2);

    if (connect(fd, res->ai_addr, res->ai_addrlen) < 0) {
        netClose(fd);
        freeaddrinfo(res);
        connected_ = false;
        return;
    }

    freeaddrinfo(res);
    ctx_->fd = fd;
    connected_ = true;
}

} // namespace pyracms
