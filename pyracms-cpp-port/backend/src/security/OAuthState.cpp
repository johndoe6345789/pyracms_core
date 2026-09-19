#include "security/OAuthState.h"

#include "security/SecurityConfig.h"

#include <cstdlib>
#include <openssl/crypto.h>
#include <openssl/hmac.h>
#include <openssl/rand.h>

namespace pyracms {

static std::string hex(const unsigned char *d, size_t n) {
    static const char *h = "0123456789abcdef";
    std::string out;
    for (size_t i = 0; i < n; ++i) {
        out += h[d[i] >> 4];
        out += h[d[i] & 15];
    }
    return out;
}

static std::string sign(const std::string &payload) {
    auto key = "oauth-state|" + resolveJwtSecret();
    unsigned char mac[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    HMAC(EVP_sha256(), key.data(), static_cast<int>(key.size()),
         reinterpret_cast<const unsigned char *>(payload.data()),
         payload.size(), mac, &len);
    return hex(mac, len);
}

std::string makeOAuthState(long long now, int ttlSeconds) {
    unsigned char nonce[16];
    RAND_bytes(nonce, sizeof nonce);
    auto payload = hex(nonce, sizeof nonce) + "." +
                   std::to_string(now + ttlSeconds);
    return payload + "." + sign(payload);
}

bool verifyOAuthState(const std::string &state, long long now) {
    auto last = state.rfind('.');
    auto first = state.find('.');
    if (last == std::string::npos || first == last)
        return false;
    auto payload = state.substr(0, last);
    auto mac = state.substr(last + 1);
    auto expected = sign(payload);
    if (mac.size() != expected.size() ||
        CRYPTO_memcmp(mac.data(), expected.data(), mac.size()) != 0)
        return false;
    char *end = nullptr;
    auto expiry = std::strtoll(state.c_str() + first + 1, &end, 10);
    return end && *end == '.' && expiry >= now;
}

} // namespace pyracms
