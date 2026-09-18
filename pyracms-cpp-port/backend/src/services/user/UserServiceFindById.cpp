#include "services/UserService.h"

namespace pyracms {

void UserService::findById(const DbClientPtr &db, int id, Callback cb) {
    db->execSqlAsync(
        "SELECT * FROM users WHERE id = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(rowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); }, id);
}

} // namespace pyracms
