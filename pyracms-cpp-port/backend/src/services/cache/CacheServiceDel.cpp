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

void CacheService::del(const std::string &key, BoolCallback cb) {
    if (!connected_) {
        cb(false);
        return;
    }
    execCommand({"DEL", key});
    cb(true);
}

} // namespace pyracms
