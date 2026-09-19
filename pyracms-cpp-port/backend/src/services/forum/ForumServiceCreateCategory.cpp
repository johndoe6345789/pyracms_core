#include "services/ForumService.h"
#include "services/DbError.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

void ForumService::createCategory(const DbClientPtr &db, int tenantId,
                                  const std::string &name, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO forum_categories (name, tenant_id) VALUES ($1, $2) "
        "RETURNING id",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        name, tenantId);
}

} // namespace pyracms
