#include "services/UserService.h"

namespace pyracms {

UserDto UserService::rowToDto(const drogon::orm::Row &row) {
    UserDto dto;
    dto.id = row["id"].as<int>();
    dto.username = row["username"].as<std::string>();
    dto.fullName = row["full_name"].as<std::string>();
    dto.email = row["email"].as<std::string>();
    dto.website =
        row["website"].isNull() ? "" : row["website"].as<std::string>();
    dto.aboutme =
        row["aboutme"].isNull() ? "" : row["aboutme"].as<std::string>();
    dto.timezone = row["timezone"].as<std::string>();
    dto.banned = row["banned"].as<bool>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.tenantId = row["tenant_id"].isNull() ? 0 : row["tenant_id"].as<int>();
    dto.apiUuid =
        row["api_uuid"].isNull() ? "" : row["api_uuid"].as<std::string>();
    // role column defaults to 1 (User) if absent or NULL
    dto.role = row["role"].isNull()
                   ? UserRole::User
                   : static_cast<UserRole>(row["role"].as<int>());
    return dto;
}

} // namespace pyracms
