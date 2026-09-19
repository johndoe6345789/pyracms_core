#include "services/MenuService.h"
#include "services/DbError.h"

namespace pyracms {

void MenuService::createMenuItem(const DbClientPtr &db, const std::string &name,
                                 const std::string &routePath,
                                 const std::string &url,
                                 const std::string &type, int groupId,
                                 int position, const std::string &permissions,
                                 int scopeTenant, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO menu_items (name, route_path, url, type, group_id, "
        "position, permissions) "
        "SELECT $1, $2, $3, $4, g.id, $6, $7 FROM menu_groups g "
        "WHERE g.id = $5 AND ($8::int = 0 OR g.tenant_id = $8::int) "
        "RETURNING id",
        [cb](const drogon::orm::Result &r) {
            r.affectedRows() ? cb(true, "") : cb(false, "Not found");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        name, routePath, url, type, groupId, position, permissions,
        scopeTenant);
}

} // namespace pyracms
