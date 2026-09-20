#include "services/TenantService.h"
#include "services/DbError.h"

namespace pyracms {

void TenantService::createEmpty(const DbClientPtr &db, const std::string &slug,
                                const std::string &displayName,
                                const std::string &description,
                                IdCallback cb) {
    db->execSqlAsync(
        "INSERT INTO tenants (slug, display_name, description, created_at) "
        "VALUES ($1, $2, $3, NOW()) RETURNING id",
        [cb](const drogon::orm::Result &r) { cb(r[0]["id"].as<int>(), ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(0, dbError(e));
        },
        slug, displayName, description);
}

// The site's founding administrator becomes its owner.
void TenantService::adoptFounder(const DbClientPtr &db, int tenantId,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE tenants SET owner_id = (SELECT id FROM users "
        "WHERE tenant_id = $1 AND is_first) WHERE id = $1",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId);
}

void TenantService::discard(const DbClientPtr &db, int tenantId) {
    db->execSqlAsync(
        "DELETE FROM tenants WHERE id = $1",
        [](const drogon::orm::Result &) {},
        [](const drogon::orm::DrogonDbException &) {}, tenantId);
}

} // namespace pyracms
