#include "services/UserService.h"
#include "services/DbError.h"

namespace pyracms {

void UserService::setUserRole(const DbClientPtr &db, int userId, UserRole role,
                              BoolCallback cb) {
    int roleInt = static_cast<int>(role);
    db->execSqlAsync(
        "UPDATE users SET role = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "User not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        roleInt, userId);
}

} // namespace pyracms
