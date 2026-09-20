#include "services/DbError.h"
#include "services/UserService.h"

namespace pyracms {

// Registering only ever creates a Normal User (role 1).
static const char *kInsert =
    "INSERT INTO users (username, full_name, email, password_hash, "
    "timezone, banned, created_at, api_uuid, tenant_id, role, is_first) "
    "VALUES ($1, $2, $3, $4, 'UTC', false, NOW(), "
    "gen_random_uuid()::text, NULLIF($5::int, 0), 1, false)";

void UserService::registerAccount(const DbClientPtr &db, int tenantId,
                                  const std::string &username,
                                  const std::string &fullName,
                                  const std::string &email,
                                  const std::string &passwordHash,
                                  BoolCallback cb) {
    db->execSqlAsync(
        kInsert, [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        username, fullName, email, passwordHash, tenantId);
}

} // namespace pyracms
