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

void CacheService::set(const std::string &key, const std::string &value,
                       int ttlSeconds, BoolCallback cb) {
    if (!connected_) {
        cb(false);
        return;
    }
    auto result =
        execCommand({"SET", key, value, "EX", std::to_string(ttlSeconds)});
    cb(result == "OK");
}

} // namespace pyracms
