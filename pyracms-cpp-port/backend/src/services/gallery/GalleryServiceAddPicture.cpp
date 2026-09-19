#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::addPicture(const DbClientPtr &db, int albumId,
                                const std::string &displayName,
                                const std::string &description,
                                const std::string &fileUuid, int userId,
                                BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gallery_pictures (album_id, display_name, description, "
        "file_uuid, user_id, is_private, created_at) "
        "VALUES ($1, $2, $3, $4, $5, false, NOW()) "
        "RETURNING id",
        [cb](const drogon::orm::Result &result) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        albumId, displayName, description, fileUuid, userId);
}

} // namespace pyracms
