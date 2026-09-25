#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

GalleryAlbumDto GalleryService::albumRowToDto(const drogon::orm::Row &row) {
    GalleryAlbumDto dto;
    dto.id = row["id"].as<int>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.description =
        row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.isPrivate = row["is_private"].as<bool>();
    dto.isProtected = row["is_protected"].as<bool>();
    dto.userId = row["user_id"].as<int>();
    dto.defaultPictureId = row["default_picture_id"].isNull()
                               ? 0
                               : row["default_picture_id"].as<int>();
    dto.pictureCount =
        row["picture_count"].isNull() ? 0 : row["picture_count"].as<int>();
    dto.sortOrder = row["sort_order"].as<std::string>();
    dto.coverMode = row["cover_mode"].as<std::string>();
    dto.coverFileUuid =
        row["cover_uuid"].isNull() ? "" : row["cover_uuid"].as<std::string>();
    return dto;
}

} // namespace pyracms
