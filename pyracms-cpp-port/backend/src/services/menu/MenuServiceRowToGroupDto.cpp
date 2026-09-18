#include "services/MenuService.h"

namespace pyracms {

MenuGroupDto MenuService::rowToGroupDto(const drogon::orm::Row &row) {
    MenuGroupDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    return dto;
}

} // namespace pyracms
