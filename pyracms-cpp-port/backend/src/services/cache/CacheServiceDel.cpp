#include "services/CacheService.h"

#include <cstring>
#include <sstream>

namespace pyracms {

void CacheService::del(const std::string &key, BoolCallback cb) {
    if (!connected_) {
        cb(false);
        return;
    }
    execCommand({"DEL", key});
    cb(true);
}

} // namespace pyracms
