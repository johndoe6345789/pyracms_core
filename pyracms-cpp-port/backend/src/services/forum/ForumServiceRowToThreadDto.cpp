#include "services/ForumService.h"
#include "services/forum/ForumServiceInternal.h"

namespace pyracms {

ForumThreadDto ForumService::rowToThreadDto(const drogon::orm::Row &row) {
    ForumThreadDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.description =
        row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.forumId = row["forum_id"].as<int>();
    dto.viewCount = row["view_count"].as<int>();
    dto.totalPosts = row["total_posts"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.userId = row["user_id"].as<int>();
    dto.authorUsername = row["username"].as<std::string>();
    dto.lastPostAt = row["last_post_at"].as<std::string>();
    dto.forumName = row["forum_name"].as<std::string>();
    dto.pinned = row["is_pinned"].as<bool>();
    dto.locked = row["is_locked"].as<bool>();
    return dto;
}

} // namespace pyracms
