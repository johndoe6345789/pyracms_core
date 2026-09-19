#include "services/DbError.h"
#include "services/UserService.h"

namespace pyracms {

// The founding account of a scope (platform: SuperAdmin, site: SiteAdmin)
// is decided inside the INSERT. The partial unique index uq_users_scope_first
// makes the race between two first registrations safe: the loser's insert
// conflicts, is skipped, and is retried as an ordinary account.
static const char *kInsert =
    "INSERT INTO users (username, full_name, email, password_hash, "
    "timezone, banned, created_at, api_uuid, tenant_id, role, is_first) "
    "SELECT $1, $2, $3, $4, 'UTC', false, NOW(), gen_random_uuid()::text, "
    "NULLIF($5::int, 0), "
    "CASE WHEN f.first THEN (CASE WHEN $5::int = 0 THEN 4 ELSE 3 END) "
    "ELSE 1 END, f.first "
    "FROM (SELECT NOT EXISTS (SELECT 1 FROM users "
    "WHERE COALESCE(tenant_id, 0) = $5::int) AS first) f "
    "ON CONFLICT (COALESCE(tenant_id, 0)) WHERE is_first DO NOTHING "
    "RETURNING is_first";

void UserService::registerAccount(const DbClientPtr &db, int tenantId,
                                  const std::string &username,
                                  const std::string &fullName,
                                  const std::string &email,
                                  const std::string &passwordHash,
                                  int attempt, RegisterCallback cb) {
    db->execSqlAsync(
        kInsert,
        [=, this](const drogon::orm::Result &r) {
            if (!r.empty()) {
                cb(true, "", r[0]["is_first"].as<bool>());
            } else if (attempt < 3) {
                registerAccount(db, tenantId, username, fullName, email,
                                passwordHash, attempt + 1, cb);
            } else {
                cb(false, "Registration failed", false);
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e), false);
        },
        username, fullName, email, passwordHash, tenantId);
}

} // namespace pyracms
