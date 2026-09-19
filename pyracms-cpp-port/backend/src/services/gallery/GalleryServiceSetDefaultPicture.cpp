#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::setDefaultPicture(const DbClientPtr &db, int albumId,
                                       int pictureId, BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gallery_albums SET default_picture_id = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        pictureId, albumId);
}

} // namespace pyracms
