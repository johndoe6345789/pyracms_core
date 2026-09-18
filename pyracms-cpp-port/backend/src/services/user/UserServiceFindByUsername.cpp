#include "services/UserService.h"

namespace pyracms {

void UserService::findByUsername(const DbClientPtr &db, int tenantId,
                                 const std::string &username, Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM users WHERE username = $1 "
        "AND COALESCE(tenant_id, 0) = $2",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        username, tenantId);
}

} // namespace pyracms
