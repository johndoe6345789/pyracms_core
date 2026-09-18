#include "services/TenantService.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

std::string TenantService::normalizeSlug(const std::string &name) {
    std::string result;
    result.reserve(name.size());

    for (unsigned char c : name) {
        if (std::isalnum(c)) {
            result += static_cast<char>(std::tolower(c));
        } else {
            // Replace any non-alphanumeric char with a hyphen separator
            if (!result.empty() && result.back() != '-') {
                result += '-';
            }
        }
    }

    // Strip trailing hyphen
    while (!result.empty() && result.back() == '-') {
        result.pop_back();
    }

    return result;
}

} // namespace pyracms
