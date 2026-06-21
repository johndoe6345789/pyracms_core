#include "services/ArticleService.h"

namespace pyracms {

ArticleDto ArticleService::rowToArticleDto(const drogon::orm::Row &row) {
    ArticleDto dto;
    dto.id = row["id"].as<int>();
    dto.name = row["name"].as<std::string>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.isPrivate = row["is_private"].as<bool>();
    dto.hideDisplayName = row["hide_display_name"].as<bool>();
    dto.userId = row["user_id"].as<int>();
    dto.rendererName = row["renderer_name"].isNull() ? "markdown" : row["renderer_name"].as<std::string>();
    dto.viewCount = row["view_count"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.status = row["status"].isNull() ? "published" : row["status"].as<std::string>();
    dto.publishedAt = row["published_at"].isNull() ? "" : row["published_at"].as<std::string>();
    dto.scheduledAt = row["scheduled_at"].isNull() ? "" : row["scheduled_at"].as<std::string>();
    return dto;
}

} // namespace pyracms
