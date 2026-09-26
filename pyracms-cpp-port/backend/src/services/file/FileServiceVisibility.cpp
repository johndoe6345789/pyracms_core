#include "services/DbError.h"
#include "services/FileService.h"

namespace pyracms {

void FileService::setVisibility(const DbClientPtr &db, const std::string &uuid,
                                const std::string &visibility,
                                BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE files SET visibility = $2 WHERE uuid = $1",
        [cb](const drogon::orm::Result &r) {
            if (r.affectedRows() == 0)
                cb(false, "File not found");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        uuid, visibility);
}

} // namespace pyracms
