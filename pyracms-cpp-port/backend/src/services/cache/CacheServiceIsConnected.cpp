#include "services/CacheService.h"

#include <cstring>
#include <sstream>

namespace pyracms {

bool CacheService::isConnected() const {
    return connected_;
}

} // namespace pyracms
