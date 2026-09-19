#pragma once

#include "filters/RoleRules.h"
#include "filters/TenantRules.h"

#include <string>

namespace pyracms {

// Who may see which accounts. Pure rules, unit-testable.
// Tenant 0 = platform accounts; a platform owner spans every tenant.

// Scope for listing users: -1 = every account, else one tenant (0 =
// platform accounts).
inline int userListScope(int rawRole, int tokenTenant) {
    bool owner = roleAllows(rawRole, UserRole::SuperAdmin);
    return (owner && tokenTenant == 0) ? -1 : tokenTenant;
}

// May the viewer see accounts of `targetTenant` at all?
inline bool canViewUser(int viewerTenant, int rawRole, int targetTenant) {
    return userListScope(rawRole, viewerTenant) == -1 ||
           viewerTenant == targetTenant;
}

// Email addresses are private: the account itself, or an administrator
// of that account's tenant (or the platform owner).
inline bool canSeeEmail(int rawRole, int viewerId, int viewerTenant,
                        int targetId, int targetTenant) {
    if (viewerId == targetId)
        return true;
    if (!roleAllows(rawRole, UserRole::SiteAdmin))
        return false;
    return tenantMatches(viewerTenant, targetTenant);
}

inline int clampLimit(const std::string &raw, int dflt, int maxValue) {
    try {
        int v = std::stoi(raw);
        if (v <= 0)
            return dflt;
        return v > maxValue ? maxValue : v;
    } catch (...) {
        return dflt;
    }
}

inline int clampOffset(const std::string &raw) {
    try {
        int v = std::stoi(raw);
        return v < 0 ? 0 : v;
    } catch (...) {
        return 0;
    }
}

} // namespace pyracms
