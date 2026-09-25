#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::getAlbum(const DbClientPtr &db, int albumId,
                              AlbumDetailCallback cb) {
    db->execSqlAsync(
        "SELECT a.*, "
        "(SELECT file_uuid FROM gallery_pictures "
        "WHERE id = a.default_picture_id) AS cover_uuid, "
        "COALESCE(p.cnt, 0) AS picture_count "
        "FROM gallery_albums a "
        "LEFT JOIN (SELECT album_id, COUNT(*) AS cnt FROM gallery_pictures "
        "GROUP BY album_id) p "
        "ON a.id = p.album_id "
        "WHERE a.id = $1",
        [this, db, albumId, cb](const drogon::orm::Result &result) {
            if (result.empty()) {
                cb(std::nullopt);
                return;
            }

            auto album = albumRowToDto(result[0]);

            // Fetch pictures for this album
            db->execSqlAsync(
                "SELECT * FROM gallery_pictures WHERE album_id = $1 "
                "ORDER BY (CASE WHEN $2::text = 'title' THEN "
                "lower(display_name) END) ASC, "
                "(CASE WHEN $2::text = 'oldest' THEN created_at END) ASC, "
                "created_at DESC",
                [this, album, cb](const drogon::orm::Result &picResult) {
                    GalleryAlbumDetailDto detail;
                    detail.album = album;
                    detail.pictures.reserve(picResult.size());
                    for (const auto &row : picResult) {
                        detail.pictures.push_back(pictureRowToDto(row));
                    }
                    cb(detail);
                },
                [cb](const drogon::orm::DrogonDbException &) {
                    cb(std::nullopt);
                },
                albumId, album.sortOrder);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(std::nullopt); },
        albumId);
}

} // namespace pyracms
