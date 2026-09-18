#include "services/MenuService.h"

namespace pyracms {

void MenuService::listMenuGroups(const DbClientPtr &db, int tenantId,
                                 GroupListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM menu_groups WHERE tenant_id = $1 ORDER BY name",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<MenuGroupDto> groups;
            groups.reserve(result.size());
            for (const auto &row : result) {
                groups.push_back(rowToGroupDto(row));
            }
            cb(groups);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId);
}

} // namespace pyracms
