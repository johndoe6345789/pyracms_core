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

// Key builders
std::string CacheService::articleKey(int tenantId, const std::string &name) {
    return "article:" + std::to_string(tenantId) + ":" + name;
}

} // namespace pyracms
