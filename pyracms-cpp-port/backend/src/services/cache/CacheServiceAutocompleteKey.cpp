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

std::string CacheService::autocompleteKey(int tenantId,
                                          const std::string &prefix) {
    return "autocomplete:" + std::to_string(tenantId) + ":" + prefix;
}

} // namespace pyracms
