#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::createAlbum(const DbClientPtr &db, int tenantId,
                                 const std::string &displayName,
                                 const std::string &description, int userId,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gallery_albums (tenant_id, display_name, description, "
        "user_id, is_private, is_protected, created_at) "
        "VALUES ($1, $2, $3, $4, false, false, NOW()) "
        "RETURNING id",
        [cb](const drogon::orm::Result &result) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        tenantId, displayName, description, userId);
}

} // namespace pyracms
