#pragma once

#include "controllers/SeoController.h"
#include "security/SsrfGuard.h"

namespace pyracms {

// base_url is echoed into feeds and JSON-LD: it must be a plain http(s)
// URL with no query, fragment, quotes or angle brackets.
inline std::string safeBaseUrl(const std::string &raw) {
    static const std::string fallback = "http://localhost:3000";
    if (raw.empty() || !parseHttpUrl(raw).ok ||
        raw.find_first_of("\"'<>&?#") != std::string::npos)
        return fallback;
    return raw;
}

} // namespace pyracms
