#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

ForumDto ForumService::rowToForumDto(const drogon::orm::Row &row) {
    ForumDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.description =
        row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.categoryId = row["category_id"].as<int>();
    dto.totalThreads =
        row["total_threads"].isNull() ? 0 : row["total_threads"].as<int>();
    dto.totalPosts =
        row["total_posts"].isNull() ? 0 : row["total_posts"].as<int>();
    return dto;
}

} // namespace pyracms
