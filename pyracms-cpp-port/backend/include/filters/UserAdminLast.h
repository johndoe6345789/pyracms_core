#pragma once

#include "filters/UserAdminTypes.h"

namespace pyracms {

// A site always keeps one active Administrator or owner: refuse the
// action that would remove the last one (demote, ban or delete).
inline AdminVerdict lastAdminVerdict(const AdminTarget &t, AdminAction act,
                                     int newRole) {
    bool removes = act == AdminAction::Ban || act == AdminAction::Delete ||
                   (act == AdminAction::SetRole && newRole < 3);
    if (t.lastAdmin && removes)
        return adminDeny(409, "Cannot remove the last administrator "
                              "of this site");
    return {};
}

} // namespace pyracms
