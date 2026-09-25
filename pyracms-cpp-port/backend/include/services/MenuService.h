#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

struct MenuGroupDto {
    int id;
    std::string name;
};

struct MenuItemDto {
    int id;
    std::string name;
    std::string routePath;
    std::string url;
    std::string type;
    int groupId;
    int position;
    std::string permissions;
    int parentId = 0; // the folder this item is in, 0 = top level
};

class MenuService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using GroupCallback =
        std::function<void(const std::optional<MenuGroupDto> &)>;
    using GroupListCallback =
        std::function<void(const std::vector<MenuGroupDto> &)>;
    using ItemCallback =
        std::function<void(const std::optional<MenuItemDto> &)>;
    using ItemListCallback =
        std::function<void(const std::vector<MenuItemDto> &)>;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;

    void listMenuGroups(const DbClientPtr &db, int tenantId,
                        GroupListCallback cb);

    void createMenuGroup(const DbClientPtr &db, int tenantId,
                         const std::string &name, BoolCallback cb);

    // scopeTenant: 0 = any tenant, else the row must belong to it.
    void deleteMenuGroup(const DbClientPtr &db, int id, int scopeTenant,
                         BoolCallback cb);

    void listMenuItems(const DbClientPtr &db, int groupId, ItemListCallback cb);

    void createMenuItem(const DbClientPtr &db, const std::string &name,
                        const std::string &routePath, const std::string &url,
                        const std::string &type, int groupId, int position,
                        const std::string &permissions, int parentId,
                        int scopeTenant, BoolCallback cb);

    void updateMenuItem(const DbClientPtr &db, int id,
                        const Json::Value &updates, int scopeTenant,
                        BoolCallback cb);

    void deleteMenuItem(const DbClientPtr &db, int id, int scopeTenant,
                        BoolCallback cb);

  private:
    MenuGroupDto rowToGroupDto(const drogon::orm::Row &row);
    MenuItemDto rowToItemDto(const drogon::orm::Row &row);
};

} // namespace pyracms
