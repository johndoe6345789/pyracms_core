#include "services/UserService.h"
#include "services/DbError.h"

namespace pyracms {

void UserService::deleteUser(const DbClientPtr &db, int id, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM users WHERE id = $1",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        id);
}

} // namespace pyracms
