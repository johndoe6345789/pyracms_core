#include "services/DbError.h"
#include "services/UserAdminSql.h"
#include "services/UserService.h"

namespace pyracms {

void UserService::listUsersScoped(const DbClientPtr &db, int scope,
                                  const std::string &search,
                                  const std::string &username, int limit,
                                  int offset, ListCallback cb) {
    static const std::string sql =
        std::string("SELECT u.*, ") + kSiteOwnerSql + " AS site_owner, " +
        kLastAdminSql +
        " AS last_admin FROM users u WHERE ($1::int < 0 OR "
        "COALESCE(u.tenant_id, 0) = $1::int) "
        "AND (COALESCE($2::text, '') = '' OR username ILIKE '%' || $2::text || "
        "'%' "
        "OR full_name ILIKE '%' || $2 || '%') "
        "AND (COALESCE($3::text, '') = '' OR username = $3::text) "
        "ORDER BY created_at DESC LIMIT $4::int OFFSET $5::int";
    db->execSqlAsync(
        sql,
        [this, cb](const drogon::orm::Result &result) {
            std::vector<UserDto> users;
            users.reserve(result.size());
            for (const auto &row : result) {
                users.push_back(rowToDto(row));
                users.back().siteOwner = row["site_owner"].as<bool>();
                users.back().lastAdmin = row["last_admin"].as<bool>();
            }
            cb(users);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "listUsersScoped: " << dbError(e);
            cb({});
        },
        scope, search, username, limit, offset);
}

} // namespace pyracms
