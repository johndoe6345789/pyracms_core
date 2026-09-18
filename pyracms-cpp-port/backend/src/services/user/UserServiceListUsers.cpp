#include "services/UserService.h"

namespace pyracms {

void UserService::listUsers(const DbClientPtr &db, int limit, int offset,
                            ListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM users ORDER BY created_at DESC LIMIT " +
            std::to_string(limit) + " OFFSET " + std::to_string(offset),
        [this, cb](const drogon::orm::Result &result) {
            std::vector<UserDto> users;
            users.reserve(result.size());
            for (const auto &row : result) {
                users.push_back(rowToDto(row));
            }
            cb(users);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); });
}

} // namespace pyracms
