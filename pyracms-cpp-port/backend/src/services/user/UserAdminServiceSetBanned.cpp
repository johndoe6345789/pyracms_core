#include "services/DbError.h"
#include "services/UserAdminService.h"

#include <ctime>

namespace pyracms {

void UserAdminService::setBanned(const DbClientPtr &db, int id, bool banned,
                                 BoolCb cb) {
    db->execSqlAsync(
        "UPDATE users SET banned = $1, "
        "token_valid_after = to_timestamp($3::bigint) WHERE id = $2",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        banned, id, static_cast<long long>(std::time(nullptr)));
}

} // namespace pyracms
