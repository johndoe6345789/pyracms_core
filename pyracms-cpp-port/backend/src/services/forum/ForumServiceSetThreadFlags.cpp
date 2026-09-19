#include "services/ForumService.h"
#include "services/DbError.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::setThreadFlags(const DbClientPtr &db, int id, int userId,
                                  bool pinned, bool locked, BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forum_threads SET is_pinned = $2, is_locked = $3 "
        "WHERE id = $4 AND (EXISTS "
        "(SELECT 1 FROM users mu WHERE mu.id = $1::int AND mu.role >= 2) "
        "OR EXISTS (SELECT 1 FROM forums xf JOIN forum_categories xc "
        "ON xc.id = xf.category_id JOIN tenants xt ON xt.id = xc.tenant_id "
        "WHERE xf.id = forum_threads.forum_id AND xt.owner_id = $1::int))",
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
