#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

void CacheService::initialize() {
    const char *h = std::getenv("REDIS_HOST");
    const char *p = std::getenv("REDIS_PORT");
    host_ = h ? h : "127.0.0.1";
    port_ = p ? std::stoi(p) : 6379;
    reconnect();
}

} // namespace pyracms
