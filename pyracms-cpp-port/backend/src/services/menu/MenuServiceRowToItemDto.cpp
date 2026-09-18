#include "services/MenuService.h"

namespace pyracms {

MenuItemDto MenuService::rowToItemDto(const drogon::orm::Row &row) {
    MenuItemDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.routePath =
        row["route_path"].isNull() ? "" : row["route_path"].as<std::string>();
    dto.url = row["url"].isNull() ? "" : row["url"].as<std::string>();
    dto.type = row["type"].isNull() ? "" : row["type"].as<std::string>();
    dto.groupId = row["group_id"].as<int>();
    dto.position = row["position"].as<int>();
    dto.permissions =
        row["permissions"].isNull() ? "" : row["permissions"].as<std::string>();
    return dto;
}

} // namespace pyracms
