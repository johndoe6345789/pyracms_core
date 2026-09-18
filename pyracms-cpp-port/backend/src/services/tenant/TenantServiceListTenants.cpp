#include "services/TenantService.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

void TenantService::listTenants(const DbClientPtr &db, ListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM tenants ORDER BY display_name",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<TenantDto> tenants;
            tenants.reserve(result.size());
            for (const auto &row : result) {
                tenants.push_back(rowToDto(row));
            }
            cb(tenants);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); });
}

} // namespace pyracms
