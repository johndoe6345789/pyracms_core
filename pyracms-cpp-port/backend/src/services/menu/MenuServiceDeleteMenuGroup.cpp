#include "services/MenuService.h"
#include "services/DbError.h"

namespace pyracms {

void MenuService::deleteMenuGroup(const DbClientPtr &db, int id,
                                  int scopeTenant, BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM menu_groups WHERE id = $1 "
        "AND ($2::int = 0 OR tenant_id = $2::int)",
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
