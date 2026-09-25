#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::setDefaultPicture(const DbClientPtr &db, int pictureId,
                                       BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gallery_albums a SET default_picture_id = p.id, "
        "cover_mode = 'chosen' "
        "FROM gallery_pictures p WHERE p.id = $1 AND a.id = p.album_id",
        [cb](const drogon::orm::Result &r) {
            if (r.affectedRows() == 0)
                cb(false, "Picture not found");
            else
                cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        pictureId);
}

} // namespace pyracms
