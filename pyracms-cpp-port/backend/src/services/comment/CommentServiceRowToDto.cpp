#include "services/CommentService.h"
#include "services/DbError.h"

namespace pyracms {

CommentDto CommentService::rowToDto(const drogon::orm::Row &row) {
    CommentDto dto;
    dto.id = row["id"].as<int>();
    dto.userId = row["user_id"].as<int>();
    dto.username = row["username"].as<std::string>();
    dto.contentType = row["content_type"].as<std::string>();
    dto.contentId = row["content_id"].as<int>();
    dto.parentId = row["parent_id"].isNull() ? 0 : row["parent_id"].as<int>();
    dto.body = row["body"].as<std::string>();
    dto.likes = row["likes"].as<int>();
    dto.dislikes = row["dislikes"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.updatedAt = row["updated_at"].as<std::string>();
    return dto;
}

} // namespace pyracms
