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

// Same work as a real check, so "no such account" costs the same time
// as "wrong password".
void AuthService::burnPasswordCheck(const std::string &password) {
    static const std::string decoy = hashPassword("decoy-password");
    verifyPassword(password, decoy);
}

} // namespace pyracms
