#include "services/UserService.h"

namespace pyracms {

void UserService::getPasswordHash(
    const DbClientPtr &db, int tenantId, const std::string &username,
    std::function<void(const std::optional<std::string> &)> cb) {
    db->execSqlAsync(
        "SELECT password_hash FROM users WHERE username = $1 "
        "AND COALESCE(tenant_id, 0) = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(result[0]["password_hash"].as<std::string>());
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        username, tenantId);
}

} // namespace pyracms
