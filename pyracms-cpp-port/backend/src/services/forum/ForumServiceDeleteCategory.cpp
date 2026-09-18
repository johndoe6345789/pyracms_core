#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::deleteCategory(const DbClientPtr &db, int id,
                                  int scopeTenant, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM forum_categories WHERE id = $1 "
        "AND ($2::int = 0 OR tenant_id = $2::int)",
        [cb](const drogon::orm::Result &r) {
            r.affectedRows() ? cb(true, "") : cb(false, "Not found");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        id, scopeTenant);
}

} // namespace pyracms
