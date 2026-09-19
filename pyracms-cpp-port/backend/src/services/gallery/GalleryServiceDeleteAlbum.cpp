#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::deleteAlbum(const DbClientPtr &db, int albumId,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM gallery_albums WHERE id = $1",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        albumId);
}

} // namespace pyracms
