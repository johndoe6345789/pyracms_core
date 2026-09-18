#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::createForum(const DbClientPtr &db, int categoryId,
                               const std::string &name,
                               const std::string &description, int scopeTenant,
                               BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forums (name, description, category_id, "
        "total_threads, total_posts) "
        "SELECT $1, $2, c.id, 0, 0 FROM forum_categories c "
        "WHERE c.id = $3 AND ($4::int = 0 OR c.tenant_id = $4::int) "
        "RETURNING id",
        [cb](const drogon::orm::Result &r) {
            r.affectedRows() ? cb(true, "") : cb(false, "Not found");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        name, description, categoryId, scopeTenant);
}

} // namespace pyracms
