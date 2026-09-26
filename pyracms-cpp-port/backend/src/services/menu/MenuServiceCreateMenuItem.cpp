#include "services/MenuService.h"
#include "services/DbError.h"

namespace pyracms {

void MenuService::createMenuItem(const DbClientPtr &db, const std::string &name,
                                 const std::string &routePath,
                                 const std::string &url,
                                 const std::string &type, int groupId,
                                 int position, const std::string &permissions,
                                 int parentId, const std::string &icon,
                                 int scopeTenant, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO menu_items (name, route_path, url, type, group_id, "
        "position, permissions, parent_id, icon) "
        "SELECT $1, $2, $3, $4, g.id, $6, $7, NULLIF($9::int, 0), $10::varchar "
        "FROM menu_groups g "
        "WHERE g.id = $5 AND ($8::int = 0 OR g.tenant_id = $8::int) "
        // the parent must be a top-level folder of this group, and folders
        // themselves stay at the top
        "AND ($9::int = 0 OR ($4::varchar <> 'folder' AND EXISTS (SELECT 1 "
        "FROM menu_items f WHERE f.id = $9::int AND f.group_id = g.id "
        "AND f.type = 'folder' AND f.parent_id IS NULL))) "
        "RETURNING id",
        [cb](const drogon::orm::Result &r) {
            r.affectedRows() ? cb(true, "") : cb(false, "Not found");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        name, routePath, url, type, groupId, position, permissions,
        scopeTenant, parentId, icon);
}

} // namespace pyracms
