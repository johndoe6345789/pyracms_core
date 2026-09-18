#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

ForumCategoryDto ForumService::rowToCategoryDto(const drogon::orm::Row &row) {
    ForumCategoryDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    return dto;
}

} // namespace pyracms
