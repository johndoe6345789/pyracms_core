#include "services/CacheService.h"

#include <cstring>
#include <sstream>

namespace pyracms {

void CacheService::invalidateSearch(int tenantId) {
    delPattern("search:" + std::to_string(tenantId) + ":*", [](bool) {});
    delPattern("autocomplete:" + std::to_string(tenantId) + ":*", [](bool) {});
}

} // namespace pyracms
