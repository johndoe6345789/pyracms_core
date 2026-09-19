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

void CacheService::getOrSet(const std::string &key, int ttlSeconds,
                            std::function<void(StringCallback)> fetcher,
                            StringCallback cb) {
    get(key, [this, key, ttlSeconds, fetcher, cb](const std::string &value,
                                                  bool found) {
        if (found) {
            cb(value, true);
            return;
        }
        // Cache miss — fetch and store
        fetcher([this, key, ttlSeconds, cb](const std::string &fetchedValue,
                                            bool success) {
            if (success && !fetchedValue.empty()) {
                set(key, fetchedValue, ttlSeconds, [](bool) {});
            }
            cb(fetchedValue, success);
        });
    });
}

} // namespace pyracms
