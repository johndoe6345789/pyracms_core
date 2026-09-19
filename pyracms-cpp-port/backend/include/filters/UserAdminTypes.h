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
    bool actorOwnsTenant{false}; // the actor owns this account's tenant
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

} // namespace pyracms
