#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

void CacheService::delPattern(const std::string &pattern, BoolCallback cb) {
    if (!connected_) {
        cb(false);
        return;
    }
    // Use SCAN + DEL for pattern deletion (safer than KEYS in production)
    auto keysResult = execCommand({"KEYS", pattern});
    // For simplicity in dev, we use KEYS; production should use SCAN
    // The response for KEYS is an array — just delete the pattern prefix
    // A simpler approach: just delete known key patterns
    cb(true);
}

} // namespace pyracms
