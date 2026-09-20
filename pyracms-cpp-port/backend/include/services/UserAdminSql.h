#pragma once

namespace pyracms {

// SQL fragments over `users u`: is the row its site's owner, and is it
// the last active Administrator-or-owner of its site (tenant 0 is the
// platform, which has its own last-Platform-Owner rule).
inline constexpr const char *kSiteOwnerSql =
    "EXISTS (SELECT 1 FROM tenants t WHERE t.id = u.tenant_id "
    "AND t.owner_id = u.id)";

inline constexpr const char *kLastAdminSql =
    "(COALESCE(u.tenant_id, 0) <> 0 AND NOT u.banned "
    "AND (COALESCE(u.role, 1) >= 3 OR EXISTS (SELECT 1 FROM tenants t "
    "WHERE t.id = u.tenant_id AND t.owner_id = u.id)) "
    "AND NOT EXISTS (SELECT 1 FROM users o WHERE o.id <> u.id "
    "AND NOT o.banned AND ((o.tenant_id = u.tenant_id "
    "AND COALESCE(o.role, 1) >= 3) OR o.id = (SELECT t2.owner_id "
    "FROM tenants t2 WHERE t2.id = u.tenant_id))))";

} // namespace pyracms
