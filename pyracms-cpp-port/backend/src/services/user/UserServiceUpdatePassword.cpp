#include "services/UserService.h"

namespace pyracms {

void UserService::updatePassword(const DbClientPtr &db, int id,
                                 const std::string &newHash, BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        newHash, id);
}

} // namespace pyracms
