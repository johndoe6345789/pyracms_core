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

std::string CacheService::searchKey(int tenantId, const std::string &query,
                                    const std::string &type) {
    return "search:" + std::to_string(tenantId) + ":" + query + ":" + type;
}

} // namespace pyracms
