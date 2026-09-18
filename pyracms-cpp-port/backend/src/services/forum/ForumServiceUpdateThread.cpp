#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::updateThread(const DbClientPtr &db, int id, int userId,
                                const std::string &title,
                                const std::string &description,
                                BoolCallback cb) {
    db->execSqlAsync(
        std::string("UPDATE forum_threads SET name = $2, description = $3 "
                    "WHERE id = $4 AND ") +
            kOwnerOrMod,
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Thread not found or not permitted");
                return;
            }
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        userId, title, description, id);
}

} // namespace pyracms
