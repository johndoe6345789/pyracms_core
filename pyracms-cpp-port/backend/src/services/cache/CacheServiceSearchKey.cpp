#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

std::string CacheService::searchKey(int tenantId, const std::string &query,
                                    const std::string &type) {
    return "search:" + std::to_string(tenantId) + ":" + query + ":" + type;
}

} // namespace pyracms
