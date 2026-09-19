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

void CacheService::invalidateSearch(int tenantId) {
    delPattern("search:" + std::to_string(tenantId) + ":*", [](bool) {});
    delPattern("autocomplete:" + std::to_string(tenantId) + ":*", [](bool) {});
}

} // namespace pyracms
