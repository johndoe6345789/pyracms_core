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

bool AuthService::verifyPassword(const std::string &password,
                                 const std::string &storedHash) {
    // Parse "salt_hex:hash_hex"
    auto colonPos = storedHash.find(':');
    if (colonPos == std::string::npos) {
        return false;
    }

    auto saltHex = storedHash.substr(0, colonPos);
    auto expectedHashHex = storedHash.substr(colonPos + 1);

    auto salt = hexToBytes(saltHex);
    if (salt.size() != SALT_LEN) {
        return false;
    }

    unsigned char computedHash[HASH_LEN];
    PKCS5_PBKDF2_HMAC(password.c_str(), static_cast<int>(password.length()),
                      salt.data(), SALT_LEN, ITERATIONS, EVP_sha256(), HASH_LEN,
                      computedHash);

    auto computedHex = bytesToHex(computedHash, HASH_LEN);
    if (expectedHashHex.length() != computedHex.length())
        return false;
    // Constant-time comparison to prevent timing attacks
    return CRYPTO_memcmp(computedHex.c_str(), expectedHashHex.c_str(),
                         computedHex.length()) == 0;
}

} // namespace pyracms
