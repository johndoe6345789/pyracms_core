#include "services/MenuService.h"
#include "services/DbError.h"

namespace pyracms {

void MenuService::deleteMenuItem(const DbClientPtr &db, int id, int scopeTenant,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM menu_items WHERE id = $1 AND ($2::int = 0 OR "
        "group_id IN (SELECT id FROM menu_groups "
        "WHERE tenant_id = $2::int))",
        [cb](const drogon::orm::Result &result) {
            if (result.affectedRows() == 0) {
                cb(false, "Not found");
            } else {
                cb(true, "");
            }
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        id, scopeTenant);
}

} // namespace pyracms
