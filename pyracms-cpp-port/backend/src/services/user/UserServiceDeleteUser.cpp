#include "services/UserService.h"

namespace pyracms {

void UserService::deleteUser(const DbClientPtr &db, int id, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM users WHERE id = $1",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        id);
}

} // namespace pyracms
