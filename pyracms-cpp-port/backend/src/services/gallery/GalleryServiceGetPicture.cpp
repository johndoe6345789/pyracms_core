#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::getPicture(const DbClientPtr &db, int pictureId,
                                PictureCallback cb) {
    db->execSqlAsync(
        "SELECT * FROM gallery_pictures WHERE id = $1",
        [this, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
            } else {
                cb(pictureRowToDto(result[0]));
            }
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        pictureId);
}

} // namespace pyracms
