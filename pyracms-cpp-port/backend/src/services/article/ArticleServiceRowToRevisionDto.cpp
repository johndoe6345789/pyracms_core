#include "services/ArticleService.h"

namespace pyracms {

ArticleRevisionDto ArticleService::rowToRevisionDto(const drogon::orm::Row &row) {
    ArticleRevisionDto dto;
    dto.id = row["id"].as<int>();
    dto.articleId = row["article_id"].as<int>();
    dto.content = row["content"].as<std::string>();
    dto.summary = row["summary"].isNull() ? "" : row["summary"].as<std::string>();
    dto.userId = row["user_id"].isNull() ? 0 : row["user_id"].as<int>();
    dto.authorUsername = row["author_username"].isNull()
        ? "" : row["author_username"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    return dto;
}

} // namespace pyracms
