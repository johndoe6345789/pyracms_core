#pragma once

#include "controllers/AnalyticsController.h"
#include "filters/UserVisibility.h"

#include <functional>
#include <iomanip>
#include <openssl/sha.h>
#include <sstream>

namespace pyracms {

// A tracked path is a site-relative URL: starts with "/", printable only.
inline bool validTrackPath(const std::string &p) {
    if (p.empty() || p[0] != '/')
        return false;
    for (unsigned char c : p) {
        if (c < 0x20 || c == 0x7f)
            return false;
    }
    return true;
}

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
