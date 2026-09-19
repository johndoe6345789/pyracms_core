#include "services/DbError.h"
#include "services/UserAdminService.h"

#include <ctime>

namespace pyracms {

void UserAdminService::setRole(const DbClientPtr &db, int id, int role,
                               BoolCb cb) {
    db->execSqlAsync(
        "UPDATE users SET role = $1, "
        "token_valid_after = to_timestamp($3::bigint) WHERE id = $2",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        role, id, static_cast<long long>(std::time(nullptr)));
}

} // namespace pyracms
