#include "services/UserService.h"
#include "services/DbError.h"

#include <ctime>

namespace pyracms {

// token_valid_after uses this server's clock (the one that stamps the
// tokens), so database clock skew cannot invalidate fresh sessions.
void UserService::updatePassword(const DbClientPtr &db, int id,
                                 const std::string &newHash, BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE users SET password_hash = $1, "
        "token_valid_after = to_timestamp($3::bigint) WHERE id = $2",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        newHash, id, static_cast<long long>(std::time(nullptr)));
}

} // namespace pyracms
