#pragma once

#include <string>

namespace pyracms {

// SQL predicate: may the acting user moderate a row of one site?
//   actor       - the placeholder holding the acting user id ("$1")
//   tenantExpr  - SQL yielding the id of the site the row lives in
// True for a Moderator or above of THAT site, the site's owner, or a
// Platform Owner. A moderator of another site is never enough: accounts
// are per site, so role >= 2 alone must not reach across sites.
inline std::string canModerateSql(const std::string &actor,
                                  const std::string &tenantExpr) {
    return "(EXISTS (SELECT 1 FROM users mu WHERE mu.id = " + actor +
           "::int AND (mu.role >= 4 OR (mu.role >= 2 AND mu.tenant_id = (" +
           tenantExpr + ")))) OR EXISTS (SELECT 1 FROM tenants mt WHERE "
           "mt.id = (" + tenantExpr + ") AND mt.owner_id = " + actor +
           "::int))";
}

// Site of a forum thread row named `t` (a table alias or table name).
inline std::string threadTenantSql(const std::string &t) {
    return "SELECT xc.tenant_id FROM forums xf JOIN forum_categories xc "
           "ON xc.id = xf.category_id WHERE xf.id = " + t + ".forum_id";
}

// Site of a forum post row named `p`.
inline std::string postTenantSql(const std::string &p) {
    return "SELECT xc.tenant_id FROM forum_threads xh JOIN forums xf "
           "ON xf.id = xh.forum_id JOIN forum_categories xc "
           "ON xc.id = xf.category_id WHERE xh.id = " + p + ".thread_id";
}

} // namespace pyracms
