#include "services/TenantService.h"

#include <algorithm>
#include <cctype>

namespace pyracms {

// DB-backed methods
TenantDto TenantService::rowToDto(const drogon::orm::Row &row) {
    TenantDto dto;
    dto.id = row["id"].as<int>();
    dto.slug = row["slug"].as<std::string>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.description =
        row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.ownerId = row["owner_id"].as<int>();
    dto.createdAt = row["created_at"].as<std::string>();
    return dto;
}

} // namespace pyracms
