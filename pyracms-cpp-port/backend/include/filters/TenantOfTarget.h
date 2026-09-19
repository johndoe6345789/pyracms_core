#pragma once

#include <functional>
#include <string>

namespace pyracms {

// Which row an admin-level route acts on, read from its path (or, for
// forum creation, the body's categoryId), so the row's own site can be
// looked up instead of trusting a tenant named by the caller.
enum class AdminKind { None, ForumCategory, Forum, MenuGroup, MenuItem };

struct AdminTarget {
    AdminKind kind{AdminKind::None};
    int id{0}; // 0 = missing or malformed
};

AdminTarget adminTargetOf(const std::string &path, int bodyCategoryId);

// Outcome of matching the site a caller names against the site the target
// row really lives in. status 0 = proceed with `tenant`.
struct TenantChoice {
    int status{0};
    int tenant{0};
};

inline TenantChoice chooseTenant(bool hasTarget, int resolved, int named) {
    if (!hasTarget)
        return named == 0 ? TenantChoice{403, 0} : TenantChoice{0, named};
    if (resolved == 0 || (named != 0 && named != resolved))
        return {404, 0};
    return {0, resolved};
}

// ok=false: lookup failed. tenant 0: no such row. Tests may replace it.
using TenantCb = std::function<void(bool ok, int tenant)>;
using TenantLookup = std::function<void(const AdminTarget &, TenantCb)>;
TenantLookup &tenantOfTarget();

} // namespace pyracms
