#include "services/ForumService.h"
#include "services/DbError.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::deleteForum(const DbClientPtr &db, int id, int scopeTenant,
                               BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM forums WHERE id = $1 "
        "AND ($2::int = 0 OR EXISTS (SELECT 1 FROM forum_categories c "
        "WHERE c.id = forums.category_id AND c.tenant_id = $2::int))",
        [cb](const drogon::orm::Result &r) {
            r.affectedRows() ? cb(true, "") : cb(false, "Not found");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        id, scopeTenant);
}

} // namespace pyracms
