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

void CacheService::get(const std::string &key, StringCallback cb) {
    if (!connected_) {
        cb("", false);
        return;
    }
    auto result = execCommand({"GET", key});
    cb(result, !result.empty());
}

} // namespace pyracms
