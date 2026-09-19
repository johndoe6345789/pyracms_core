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

std::optional<TokenPayload> AuthService::verifyToken(const std::string &token) {
    try {
        auto verifier = jwt::verify()
                            .allow_algorithm(jwt::algorithm::hs256{jwtSecret_})
                            .with_issuer("pyracms");

        auto decoded = jwt::decode(token);
        verifier.verify(decoded);
        // A token that never expires is never accepted.
        if (!decoded.has_expires_at() || !decoded.has_issued_at())
            return std::nullopt;

        TokenPayload payload;
        payload.userId = std::stoi(decoded.get_subject());
        payload.issuedAt = std::chrono::duration_cast<std::chrono::seconds>(
                               decoded.get_issued_at().time_since_epoch())
                               .count();
        payload.username = decoded.get_payload_claim("username").as_string();
        payload.tenantId =
            decoded.has_payload_claim("tenantId")
                ? std::stoi(decoded.get_payload_claim("tenantId").as_string())
                : 0;
        return payload;
    } catch (const std::exception &) {
        return std::nullopt;
    }
}

} // namespace pyracms
