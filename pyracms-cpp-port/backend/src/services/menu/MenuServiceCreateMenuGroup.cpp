#include "services/MenuService.h"
#include "services/DbError.h"

namespace pyracms {

void MenuService::createMenuGroup(const DbClientPtr &db, int tenantId,
                                  const std::string &name, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO menu_groups (tenant_id, name) VALUES ($1, $2) RETURNING "
        "id",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, name);
}

} // namespace pyracms
