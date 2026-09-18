#include "services/MenuService.h"

namespace pyracms {

void MenuService::listMenuItems(const DbClientPtr &db, int groupId,
                                ItemListCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM menu_items WHERE group_id = $1 ORDER BY position",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<MenuItemDto> items;
            items.reserve(result.size());
            for (const auto &row : result) {
                items.push_back(rowToItemDto(row));
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, groupId);
}

} // namespace pyracms
