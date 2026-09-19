#pragma once

#include "security/SecurityConfig.h"
#include "services/AuthService.h"

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

// PBKDF2 with OpenSSL — proper password hashing
// Format: "salt_hex:hash_hex" (salt is 16 bytes, hash is 32 bytes)
inline constexpr int SALT_LEN = 16;

inline constexpr int HASH_LEN = 32;

inline constexpr int ITERATIONS = 100000;

inline std::string bytesToHex(const unsigned char *data, int len) {
    std::stringstream ss;
    for (int i = 0; i < len; ++i) {
        ss << std::hex << std::setfill('0') << std::setw(2)
           << static_cast<int>(data[i]);
    }
    return ss.str();
}

// Malformed hex (corrupt stored hash) yields an empty vector, never
// an exception.
inline std::vector<unsigned char> hexToBytes(const std::string &hex) {
    std::vector<unsigned char> bytes;
    if (hex.length() % 2 != 0)
        return bytes;
    bytes.reserve(hex.length() / 2);
    for (size_t i = 0; i < hex.length(); i += 2) {
        auto hi = std::isxdigit(static_cast<unsigned char>(hex[i]));
        auto lo = std::isxdigit(static_cast<unsigned char>(hex[i + 1]));
        if (!hi || !lo)
            return {};
        bytes.push_back(static_cast<unsigned char>(
            std::stoi(hex.substr(i, 2), nullptr, 16)));
    }
    return bytes;
}

} // namespace pyracms
