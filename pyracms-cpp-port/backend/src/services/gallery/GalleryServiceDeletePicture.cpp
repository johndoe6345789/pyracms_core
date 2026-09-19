#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::deletePicture(const DbClientPtr &db, int pictureId,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM gallery_pictures WHERE id = $1",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        pictureId);
}

} // namespace pyracms
