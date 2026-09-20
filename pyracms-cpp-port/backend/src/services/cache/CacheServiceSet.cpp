#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

void CacheService::set(const std::string &key, const std::string &value,
                       int ttlSeconds, BoolCallback cb) {
    if (!connected_) {
        cb(false);
        return;
    }
    auto result =
        execCommand({"SET", key, value, "EX", std::to_string(ttlSeconds)});
    cb(result == "OK");
}

} // namespace pyracms
