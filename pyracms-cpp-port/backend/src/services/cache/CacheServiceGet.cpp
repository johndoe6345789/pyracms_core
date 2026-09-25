#include "services/CacheService.h"

#include <cstring>
#include <sstream>

namespace pyracms {

void CacheService::get(const std::string &key, StringCallback cb) {
    if (!connected_) {
        cb("", false);
        return;
    }
    auto result = execCommand({"GET", key});
    cb(result, !result.empty());
}

} // namespace pyracms
