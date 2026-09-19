#include "services/UserService.h"

namespace pyracms {

void UserService::listUsersScoped(const DbClientPtr &db, int scope,
                                  const std::string &search,
                                  const std::string &username, int limit,
                                  int offset, ListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM users WHERE ($1::int < 0 OR COALESCE(tenant_id, 0) = $1::int) "
        "AND ($2::text = '' OR username ILIKE '%' || $2::text || '%' "
        "OR full_name ILIKE '%' || $2 || '%') "
        "AND ($3::text = '' OR username = $3::text) "
        "ORDER BY created_at DESC LIMIT $4 OFFSET $5",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<UserDto> users;
            users.reserve(result.size());
            for (const auto &row : result)
                users.push_back(rowToDto(row));
            cb(users);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, scope,
        search, username, limit, offset);
}

} // namespace pyracms
