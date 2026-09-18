#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

ForumPostDto ForumService::rowToPostDto(const drogon::orm::Row &row) {
    ForumPostDto dto;
    dto.id = row["id"].as<int>();
    dto.title = row["title"].isNull() ? "" : row["title"].as<std::string>();
    dto.content = row["content"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.userId = row["user_id"].isNull() ? 0 : row["user_id"].as<int>();
    dto.username =
        row["username"].isNull() ? "" : row["username"].as<std::string>();
    dto.threadId = row["thread_id"].as<int>();
    return dto;
}

} // namespace pyracms
