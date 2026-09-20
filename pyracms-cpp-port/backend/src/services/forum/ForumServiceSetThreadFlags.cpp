#include "services/ForumService.h"
#include "services/DbError.h"
#include "services/ModerationSql.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::setThreadFlags(const DbClientPtr &db, int id, int userId,
                                  bool pinned, bool locked, BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forum_threads SET is_pinned = $2, is_locked = $3 "
        "WHERE id = $4 AND " +
            canModerateSql("$1", threadTenantSql("forum_threads")),
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Thread not found or not permitted");
                return;
            }
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        userId, pinned, locked, id);
}

} // namespace pyracms
