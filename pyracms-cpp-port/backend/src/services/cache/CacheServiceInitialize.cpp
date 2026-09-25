#include "services/CacheService.h"

namespace pyracms {

void CacheService::initialize() {
    const char *h = std::getenv("REDIS_HOST");
    const char *p = std::getenv("REDIS_PORT");
    host_ = h ? h : "127.0.0.1";
    port_ = p ? std::stoi(p) : 6379;
    pool_ = std::make_unique<RedisPool>(host_, port_);
    // Only whether to use the cache at all is decided here; if Redis goes
    // away later the pool copes (calls just miss until it is back).
    connected_ = pool_->command({"PING"}).ok;
}

} // namespace pyracms
