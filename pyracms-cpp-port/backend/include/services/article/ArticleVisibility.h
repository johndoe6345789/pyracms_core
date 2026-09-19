#pragma once

#include <string>

namespace pyracms {

// SQL predicate: may the viewer (placeholder such as "$3::int"; 0 =
// anonymous) see article alias `a`? Published public articles are open;
// anything else (private, draft, scheduled, unpublished) is visible only
// to its author, moderators (role >= 2) and the owner of the site.
inline std::string articleVisibleSql(const std::string &viewer,
                                     const std::string &a = "a") {
    return "((" + a + ".is_private = false AND " + a +
           ".status = 'published') OR " + a + ".user_id = " + viewer +
           " OR EXISTS (SELECT 1 FROM users vu WHERE vu.id = " + viewer +
           " AND vu.role >= 2) OR EXISTS (SELECT 1 FROM tenants vt WHERE "
           "vt.id = " + a + ".tenant_id AND vt.owner_id = " + viewer + "))";
}

} // namespace pyracms
