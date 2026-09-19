#include "services/DbError.h"
#include "services/NotificationService.h"

namespace pyracms {

NotificationDto NotificationService::rowToDto(const drogon::orm::Row &row) {
    NotificationDto dto;
    dto.id = row["id"].as<int>();
    dto.userId = row["user_id"].as<int>();
    dto.type = row["type"].as<std::string>();
    dto.title = row["title"].as<std::string>();
    dto.message =
        row["message"].isNull() ? "" : row["message"].as<std::string>();
    dto.link = row["link"].isNull() ? "" : row["link"].as<std::string>();
    dto.isRead = row["is_read"].as<bool>();
    dto.createdAt = row["created_at"].as<std::string>();
    return dto;
}

} // namespace pyracms
