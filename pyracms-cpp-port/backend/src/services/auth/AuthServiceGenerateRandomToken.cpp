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

std::string AuthService::generateRandomToken() {
    unsigned char bytes[32];
    RAND_bytes(bytes, 32);
    return bytesToHex(bytes, 32);
}

} // namespace pyracms
