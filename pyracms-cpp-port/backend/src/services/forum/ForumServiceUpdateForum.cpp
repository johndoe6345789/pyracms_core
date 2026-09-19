#include "services/ForumService.h"
#include "services/DbError.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::updateForum(const DbClientPtr &db, int id,
                               const std::string &name,
                               const std::string &description, int scopeTenant,
                               BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forums SET name = $1, description = $2 WHERE id = $3 "
        "AND ($4::int = 0 OR EXISTS (SELECT 1 FROM forum_categories c "
        "WHERE c.id = forums.category_id AND c.tenant_id = $4::int))",
        [cb](const drogon::orm::Result &r) {
            r.affectedRows() ? cb(true, "") : cb(false, "Not found");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        name, description, id, scopeTenant);
}

} // namespace pyracms
