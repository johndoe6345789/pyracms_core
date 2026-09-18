#include "services/TenantService.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

// Static helpers
bool TenantService::isValidSlug(const std::string &slug) {
    if (slug.empty())
        return false;
    if (slug.front() == '-' || slug.back() == '-')
        return false;
    for (char c : slug) {
        bool ok = (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '-';
        if (!ok)
            return false;
    }
    return true;
}

} // namespace pyracms
