#include "services/UserService.h"

namespace pyracms {

void UserService::getUserRole(const DbClientPtr &db, int userId,
                              RoleCallback cb) {
    db->execSqlAsync(
        "SELECT role FROM users WHERE id = $1",
        [cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                const auto &roleField = result[0]["role"];
                int raw = roleField.isNull() ? 1 : roleField.as<int>();
                if (raw < 0 || raw > 4)
                    raw = 1; // clamp to UserRole::User
                cb(static_cast<UserRole>(raw));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        userId);
}

} // namespace pyracms
