#include "services/MenuService.h"
#include "services/DbError.h"

namespace pyracms {

void MenuService::updateMenuItem(const DbClientPtr &db, int id,
                                 const Json::Value &updates, int scopeTenant,
                                 BoolCallback cb) {
    std::string sql = "UPDATE menu_items SET ";
    std::vector<std::string> params;
    auto add = [&](const char *jsonKey, const char *col, bool isInt) {
        if (!updates.isMember(jsonKey))
            return;
        sql += (params.empty() ? "" : ", ") + std::string(col) + " = $" +
               std::to_string(params.size() + 1);
        params.push_back(isInt ? std::to_string(updates[jsonKey].asInt())
                               : updates[jsonKey].asString());
    };
    add("name", "name", false);
    add("routePath", "route_path", false);
    add("url", "url", false);
    add("type", "type", false);
    add("permissions", "permissions", false);
    add("icon", "icon", false);
    add("groupId", "group_id", true);
    add("position", "position", true);
    // Moving into (or out of) a folder: 0 = the top level. The folder must
    // be a top-level folder of the item's own group; folders don't nest.
    std::string parentCheck;
    if (updates.isMember("parentId")) {
        sql += (params.empty() ? "" : ", ") + std::string("parent_id = ") +
               "NULLIF($" + std::to_string(params.size() + 1) + "::int, 0)";
        auto ph = "$" + std::to_string(params.size() + 1) + "::int";
        params.push_back(std::to_string(updates["parentId"].asInt()));
        parentCheck = " AND (" + ph + " = 0 OR (menu_items.type <> 'folder' "
                      "AND EXISTS (SELECT 1 FROM menu_items f WHERE f.id = " +
                      ph + " AND f.group_id = menu_items.group_id AND "
                      "f.type = 'folder' AND f.parent_id IS NULL)))";
    }
    if (params.empty()) {
        cb(false, "No fields to update");
        return;
    }
    // scopeTenant is an int, so inlining it cannot inject SQL.
    auto scope = std::to_string(scopeTenant);
    sql += " WHERE id = $" + std::to_string(params.size() + 1) + " AND (" +
           scope + " = 0 OR group_id IN (SELECT id FROM menu_groups " +
           "WHERE tenant_id = " + scope + "))" + parentCheck;
    params.push_back(std::to_string(id));

    auto binder = *db << sql;
    for (const auto &p : params)
        binder << p;
    binder >> [cb](const drogon::orm::Result &r) {
        r.affectedRows() ? cb(true, "") : cb(false, "Not found");
    } >> [cb](const drogon::orm::DrogonDbException &e) {
        cb(false, dbError(e));
    };
}

} // namespace pyracms
