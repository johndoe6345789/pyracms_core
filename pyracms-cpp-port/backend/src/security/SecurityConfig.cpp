#include "security/SecurityConfig.h"

#include <cstdlib>
#include <cstring>
#include <openssl/rand.h>

namespace pyracms {

static bool envIs(const char *key, const char *want) {
    const char *v = std::getenv(key);
    return v && std::strcmp(v, want) == 0;
}

bool isProduction() {
    return envIs("PYRACMS_ENV", "production") ||
           envIs("APP_ENV", "production") || envIs("NODE_ENV", "production");
}

std::string weakSecretReason(const char *secret) {
    if (!secret || !*secret)
        return "JWT_SECRET is not set";
    std::string s = secret;
    for (const char *marker : {"change-me", "dev-secret", "insecure",
                               "do-not-use", "changeme", "placeholder"}) {
        if (s.find(marker) != std::string::npos)
            return "JWT_SECRET is a placeholder value";
    }
    if (s.size() < 32)
        return "JWT_SECRET must be at least 32 characters";
    return "";
}

static std::string randomSecret() {
    unsigned char b[32];
    RAND_bytes(b, sizeof b);
    static const char *hex = "0123456789abcdef";
    std::string out;
    for (unsigned char c : b) {
        out += hex[c >> 4];
        out += hex[c & 15];
    }
    return out;
}

std::string resolveJwtSecret() {
    const char *env = std::getenv("JWT_SECRET");
    if (env && *env)
        return env;
    static const std::string devSecret = randomSecret();
    return devSecret;
}

std::string startupSecurityError() {
    if (!isProduction())
        return "";
    return weakSecretReason(std::getenv("JWT_SECRET"));
}

} // namespace pyracms
