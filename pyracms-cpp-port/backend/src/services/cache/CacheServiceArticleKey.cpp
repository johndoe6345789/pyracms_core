#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

// Key builders
std::string CacheService::articleKey(int tenantId, const std::string &name) {
    return "article:" + std::to_string(tenantId) + ":" + name;
}

} // namespace pyracms
