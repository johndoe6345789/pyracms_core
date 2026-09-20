#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

std::string CacheService::autocompleteKey(int tenantId,
                                          const std::string &prefix) {
    return "autocomplete:" + std::to_string(tenantId) + ":" + prefix;
}

} // namespace pyracms
