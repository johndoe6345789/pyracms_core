#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::updatePicture(const DbClientPtr &db, int pictureId,
                                   const std::string &displayName,
                                   const std::string &description,
                                   BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gallery_pictures SET display_name = $1, description = $2 "
        "WHERE id = $3",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        displayName, description, pictureId);
}

} // namespace pyracms
