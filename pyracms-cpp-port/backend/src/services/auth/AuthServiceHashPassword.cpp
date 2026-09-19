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

std::string AuthService::hashPassword(const std::string &password) {
    unsigned char salt[SALT_LEN];
    RAND_bytes(salt, SALT_LEN);

    unsigned char hash[HASH_LEN];
    PKCS5_PBKDF2_HMAC(password.c_str(), static_cast<int>(password.length()),
                      salt, SALT_LEN, ITERATIONS, EVP_sha256(), HASH_LEN, hash);

    return bytesToHex(salt, SALT_LEN) + ":" + bytesToHex(hash, HASH_LEN);
}

} // namespace pyracms
