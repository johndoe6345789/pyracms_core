#pragma once

#include "filters/UserAdminTypes.h"

namespace pyracms {

// The owner of the account's own site administers it like an
// Administrator, but may hand out Administrator at most, and never
// changes another owner or the last Platform Owner.
inline AdminVerdict ownerMayAdminister(const AdminTarget &t, AdminAction act,
                                       int newRole) {
    if (t.role > 3)
        return adminDeny(403, "Account has an equal or higher role");
    if (act == AdminAction::Edit)
        return {};
    if (t.siteOwner)
        return adminDeny(403, "The site owner cannot be changed");
    if (act == AdminAction::SetRole) {
        if (newRole < 0 || newRole > 4)
            return adminDeny(400, "Invalid role");
        if (newRole > 3)
            return adminDeny(403, "You cannot grant that role");
    }
    if (t.lastPlatformOwner)
        return adminDeny(403, "Cannot remove the last Platform Owner");
    return {};
}

// Same checks for every action; SetRole also passes the new role.
inline AdminVerdict canAdminister(const AdminActor &a, const AdminTarget &t,
                                  AdminAction act, int newRole = -1) {
    if (act == AdminAction::Edit && a.id == t.id)
        return {}; // anyone may edit their own profile
    if (t.actorOwnsTenant && t.tenant != 0 && a.id != t.id)
        return ownerMayAdminister(t, act, newRole);
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
