#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::updateCategory(const DbClientPtr &db, int id,
                                  const std::string &name, int scopeTenant,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE forum_categories SET name = $1 WHERE id = $2 "
        "AND ($3::int = 0 OR tenant_id = $3::int)",
        [cb](const drogon::orm::Result &r) {
            r.affectedRows() ? cb(true, "") : cb(false, "Not found");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        name, id, scopeTenant);
}

} // namespace pyracms
