#include "services/UserService.h"

namespace pyracms {

void UserService::countUsers(const DbClientPtr &db, int tenantId,
                             std::function<void(int)> cb) {
    db->execSqlAsync(
        "SELECT COUNT(*) as cnt FROM users "
        "WHERE COALESCE(tenant_id, 0) = $1",
        [cb](const drogon::orm::Result &result) {
            cb(result[0]["cnt"].as<int>());
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(0); }, tenantId);
}

} // namespace pyracms
