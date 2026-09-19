#include "services/TenantService.h"
#include "services/DbError.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

void TenantService::createTenant(const DbClientPtr &db, const std::string &slug,
                                 const std::string &displayName,
                                 const std::string &description, int ownerId,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO tenants (slug, display_name, description, owner_id, "
        "created_at) "
        "VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        slug, displayName, description, ownerId);
}

} // namespace pyracms
