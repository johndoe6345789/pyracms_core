#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

// Invalidation helpers
void CacheService::invalidateArticle(int tenantId, const std::string &name) {
    del(articleKey(tenantId, name), [](bool) {});
    invalidateArticleList(tenantId);
    invalidateSearch(tenantId);
}

} // namespace pyracms
