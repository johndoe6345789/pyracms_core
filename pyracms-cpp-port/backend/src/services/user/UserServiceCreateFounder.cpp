#include "services/DbError.h"
#include "services/UserService.h"

namespace pyracms {

// The unique index uq_users_scope_first (one is_first row per scope)
// makes two racing founders safe: the loser's insert is skipped. The
// platform additionally never gets a second Platform Owner.
static const char *kInsert =
    "INSERT INTO users (username, full_name, email, password_hash, "
    "timezone, banned, created_at, api_uuid, tenant_id, role, is_first) "
    "SELECT $1, $2, $3, $4, 'UTC', false, NOW(), "
    "gen_random_uuid()::text, NULLIF($5::int, 0), "
    "CASE WHEN $5::int = 0 THEN 4 ELSE 3 END, true "
    "WHERE $5::int <> 0 OR NOT EXISTS (SELECT 1 FROM users "
    "WHERE tenant_id IS NULL AND role >= 4) "
    "ON CONFLICT (COALESCE(tenant_id, 0)) WHERE is_first DO NOTHING "
    "RETURNING id";

void UserService::createFounder(const DbClientPtr &db, int tenantId,
                                const std::string &username,
                                const std::string &fullName,
                                const std::string &email,
                                const std::string &passwordHash,
                                BoolCallback cb) {
    db->execSqlAsync(
        kInsert,
        [cb](const drogon::orm::Result &r) {
            cb(!r.empty(), r.empty() ? "Already has an administrator" : "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        username, fullName, email, passwordHash, tenantId);
}

} // namespace pyracms
