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

std::string CacheService::articleListKey(int tenantId, int limit, int offset) {
    return "articles:" + std::to_string(tenantId) + ":" +
           std::to_string(limit) + ":" + std::to_string(offset);
}

} // namespace pyracms
