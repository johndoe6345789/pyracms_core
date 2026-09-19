#pragma once

#include "controllers/AnalyticsController.h"
#include "filters/UserVisibility.h"

#include <functional>
#include <iomanip>
#include <openssl/sha.h>
#include <sstream>

namespace pyracms {

inline std::string sha256Hash(const std::string &input) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256(reinterpret_cast<const unsigned char *>(input.c_str()), input.size(),
           hash);
    std::ostringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0')
           << static_cast<int>(hash[i]);
    }
    return ss.str();
}

} // namespace pyracms
