#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

// One statement; options left at "keep" are untouched, and a cover that is
// not one of the album's own pictures is ignored rather than trusted.
void GalleryService::updateAlbum(const DbClientPtr &db, int albumId,
                                 const std::string &displayName,
                                 const std::string &description,
                                 int isPrivate, const std::string &sortOrder,
                                 int coverId, const std::string &coverMode,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gallery_albums SET display_name = $1, description = $2, "
        "is_private = CASE WHEN $4::int < 0 THEN is_private "
        "ELSE $4::int = 1 END, "
        "sort_order = CASE WHEN $5::text = '' THEN sort_order "
        "ELSE $5::text END, "
        "default_picture_id = CASE WHEN $6::int < 0 THEN default_picture_id "
        "WHEN $6::int = 0 THEN NULL "
        "WHEN EXISTS (SELECT 1 FROM gallery_pictures "
        "WHERE id = $6::int AND album_id = $3::int) THEN $6::int "
        "ELSE default_picture_id END, "
        "cover_mode = CASE WHEN $7::text = '' THEN cover_mode "
        "ELSE $7::text END "
        "WHERE id = $3::int",
        [cb](const drogon::orm::Result &) { cb(true, ""); },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, dbError(e));
        },
        displayName, description, albumId, isPrivate, sortOrder, coverId,
        coverMode);
}

} // namespace pyracms
