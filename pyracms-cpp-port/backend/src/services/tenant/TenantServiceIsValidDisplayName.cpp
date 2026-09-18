#include "services/TenantService.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

bool TenantService::isValidDisplayName(const std::string &displayName) {
    // Must contain at least one non-whitespace character
    return std::any_of(displayName.begin(), displayName.end(),
                       [](unsigned char c) { return !std::isspace(c); });
}

} // namespace pyracms
