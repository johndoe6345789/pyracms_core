#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

CacheService &CacheService::instance() {
    static CacheService inst;
    return inst;
}

} // namespace pyracms
