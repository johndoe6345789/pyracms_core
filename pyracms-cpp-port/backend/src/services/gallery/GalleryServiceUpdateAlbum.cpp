#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::updateAlbum(const DbClientPtr &db, int albumId,
                                 const std::string &displayName,
                                 const std::string &description,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gallery_albums SET display_name = $1, description = $2 "
        "WHERE id = $3",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        displayName, description, albumId);
}

} // namespace pyracms
