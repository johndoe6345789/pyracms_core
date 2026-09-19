#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::votePicture(const DbClientPtr &db, int pictureId,
                                 int userId, bool isLike, BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gallery_picture_votes (picture_id, user_id, is_like) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (picture_id, user_id) "
        "DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        pictureId, userId, isLike);
}

} // namespace pyracms
