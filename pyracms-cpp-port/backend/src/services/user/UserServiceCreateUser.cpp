#include "services/UserService.h"
#include "services/DbError.h"

namespace pyracms {

void UserService::createUser(const DbClientPtr &db, int tenantId,
                             const std::string &username,
                             const std::string &fullName,
                             const std::string &email,
                             const std::string &passwordHash, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO users (username, full_name, email, password_hash, "
        "timezone, banned, created_at, api_uuid, tenant_id) "
        "VALUES ($1, $2, $3, $4, 'UTC', false, NOW(), "
        "gen_random_uuid()::text, NULLIF($5, 0)) "
        "RETURNING id",
        [cb](const drogon::orm::Result &result) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        username, fullName, email, passwordHash, tenantId);
}

} // namespace pyracms
