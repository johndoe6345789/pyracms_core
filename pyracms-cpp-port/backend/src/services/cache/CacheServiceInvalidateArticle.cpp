#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <arpa/inet.h>
#include <cstring>
#include <netdb.h>
#include <netinet/in.h>
#include <sstream>
#include <sys/socket.h>
#include <unistd.h>

namespace pyracms {

// Invalidation helpers
void CacheService::invalidateArticle(int tenantId, const std::string &name) {
    del(articleKey(tenantId, name), [](bool) {});
    invalidateArticleList(tenantId);
    invalidateSearch(tenantId);
}

} // namespace pyracms
