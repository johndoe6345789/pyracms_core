#include "services/TenantService.h"
#include "services/DbError.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

void TenantService::deleteTenant(const DbClientPtr &db, int id,
                                 int actingUserId, BoolCallback cb) {
    // Only the owner or a super-admin may delete a site.
    db->execSqlAsync(
        "DELETE FROM tenants WHERE id = $1 AND (owner_id = $2::int OR "
        "EXISTS (SELECT 1 FROM users u WHERE u.id = $2::int "
        "AND u.role >= 4))",
        [cb](const drogon::orm::Result &r) {
            r.affectedRows() ? cb(true, "") : cb(false, "Not found");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        id, actingUserId);
}

} // namespace pyracms
