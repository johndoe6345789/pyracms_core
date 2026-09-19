#pragma once

#include "filters/RoleRules.h"

#include <string>

namespace pyracms {

// Pure rules for administering other accounts (no drogon, no DB).
// tenant 0 = platform account. status 0 = allowed.

struct AdminActor {
    int id{0};
    int role{1};
    int tenant{0};
};

struct AdminTarget {
    int id{0};
    int role{1};
    int tenant{0};
    bool siteOwner{false};   // tenants.owner_id of its own tenant
    bool lastPlatformOwner{false};
};

struct AdminVerdict {
    int status{0};
    std::string message;
    bool ok() const { return status == 0; }
};

enum class AdminAction { Edit, Ban, Delete, SetRole };

inline bool isAdminRole(int role) { return role >= 3; }
inline bool isPlatformOwner(int role) { return role >= 4; }

// Highest role `actor` may hand out: strictly below their own.
inline int maxGrantable(int actorRole) { return actorRole - 1; }

inline AdminVerdict adminDeny(int code, const char *msg) {
    return {code, msg};
}

// Same checks for every action; SetRole also passes the new role.
inline AdminVerdict canAdminister(const AdminActor &a, const AdminTarget &t,
                                  AdminAction act, int newRole = -1) {
    if (act == AdminAction::Edit && a.id == t.id)
        return {}; // anyone may edit their own profile
    if (!isAdminRole(a.role))
        return adminDeny(403, "Administrator role required");
    if (!isPlatformOwner(a.role) && a.tenant != t.tenant)
        return adminDeny(404, "User not found");
    if (a.id == t.id)
        return adminDeny(403, "You cannot do that to your own account");
    if (!isPlatformOwner(a.role) && t.role >= a.role)
        return adminDeny(403, "Account has an equal or higher role");
    if (act == AdminAction::Edit)
        return {};
    if (t.siteOwner && !isPlatformOwner(a.role))
        return adminDeny(403, "The site owner cannot be changed");
    if (act == AdminAction::SetRole) {
        if (newRole < 0 || newRole > 4)
            return adminDeny(400, "Invalid role");
        if (newRole > maxGrantable(a.role))
            return adminDeny(403, "You cannot grant that role");
    }
    if (t.lastPlatformOwner)
        return adminDeny(403, "Cannot remove the last Platform Owner");
    return {};
}

} // namespace pyracms
