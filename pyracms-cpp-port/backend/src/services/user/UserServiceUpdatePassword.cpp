#include "services/UserService.h"
#include "services/DbError.h"

namespace pyracms {

void UserService::updatePassword(const DbClientPtr &db, int id,
                                 const std::string &newHash, BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        newHash, id);
}

} // namespace pyracms
