#pragma once

#include <string>
#include <vector>

namespace pyracms {

// Pure tenant-isolation rules (no drogon, unit-testable).
// tokenTenant 0 means a platform account, which may act on any site.

// True when `value` explicitly names a tenant other than tokenTenant.
inline bool namesOtherTenant(int tokenTenant, const std::string &value) {
    return tokenTenant != 0 && !value.empty() &&
           value != std::to_string(tokenTenant);
}

// True when any explicitly named tenant differs from the token's.
inline bool namesForeignTenant(int tokenTenant,
                               const std::vector<std::string> &named) {
    for (const auto &v : named) {
        if (namesOtherTenant(tokenTenant, v))
            return true;
    }
    return false;
}

// True when a row owned by `rowTenant` is reachable with this token.
inline bool tenantMatches(int tokenTenant, int rowTenant) {
    return tokenTenant == 0 || tokenTenant == rowTenant;
}

// Tenant to scope a by-id lookup to: the token's own tenant when it has
// one, else the (optional) tenant named by the caller; 0 = any.
inline int effectiveScope(int tokenTenant, const std::string &named) {
    if (tokenTenant != 0)
        return tokenTenant;
    try {
        return named.empty() ? 0 : std::stoi(named);
    } catch (...) {
        return 0;
    }
}

} // namespace pyracms
