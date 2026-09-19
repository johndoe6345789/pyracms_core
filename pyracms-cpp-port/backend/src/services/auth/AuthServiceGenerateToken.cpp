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

std::string AuthService::generateToken(int userId, const std::string &username,
                                       int tenantId) {
    auto now = std::chrono::system_clock::now();
    auto token =
        jwt::create()
            .set_issuer("pyracms")
            .set_subject(std::to_string(userId))
            .set_payload_claim("username", jwt::claim(username))
            .set_payload_claim("tenantId", jwt::claim(std::to_string(tenantId)))
            .set_issued_at(now)
            .set_expires_at(now + std::chrono::seconds(tokenExpirySeconds_))
            .sign(jwt::algorithm::hs256{jwtSecret_});
    return token;
}

} // namespace pyracms
