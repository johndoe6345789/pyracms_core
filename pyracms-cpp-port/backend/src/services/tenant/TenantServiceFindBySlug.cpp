#include "services/TenantService.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

void TenantService::findBySlug(const DbClientPtr &db, const std::string &slug,
                               Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM tenants WHERE slug = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        slug);
}

} // namespace pyracms
