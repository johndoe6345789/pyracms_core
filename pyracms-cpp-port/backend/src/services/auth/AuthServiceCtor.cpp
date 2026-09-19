#include "security/SecurityConfig.h"
#include "services/AuthService.h"
#include "services/auth/AuthServiceInternal.h"

#include <cctype>
#include <chrono>
#include <cstring>
#include <iomanip>
#include <jwt-cpp/traits/nlohmann-json/defaults.h>
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <random>
#include <sstream>

namespace pyracms {

AuthService::AuthService()
    : tokenExpirySeconds_(86400) // 24 hours
{
    // Never a hard-coded default: see resolveJwtSecret().
    jwtSecret_ = resolveJwtSecret();
    if (const char *ttl = std::getenv("JWT_EXPIRY_SECONDS")) {
        int v = std::atoi(ttl);
        if (v >= 60 && v <= 30 * 86400)
            tokenExpirySeconds_ = v;
    }
}

} // namespace pyracms
