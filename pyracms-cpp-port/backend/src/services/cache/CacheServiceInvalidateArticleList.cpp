#include "services/CacheService.h"

#include <cstring>
#include <sstream>

namespace pyracms {

void CacheService::invalidateArticleList(int tenantId) {
    delPattern("articles:" + std::to_string(tenantId) + ":*", [](bool) {});
}

} // namespace pyracms
