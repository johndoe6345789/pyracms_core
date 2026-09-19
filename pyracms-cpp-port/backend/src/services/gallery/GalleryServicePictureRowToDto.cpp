#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

GalleryPictureDto GalleryService::pictureRowToDto(const drogon::orm::Row &row) {
    GalleryPictureDto dto;
    dto.id = row["id"].as<int>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.description =
        row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.isPrivate = row["is_private"].as<bool>();
    dto.albumId = row["album_id"].as<int>();
    dto.fileUuid = row["file_uuid"].as<std::string>();
    dto.userId = row["user_id"].as<int>();
    return dto;
}

} // namespace pyracms
