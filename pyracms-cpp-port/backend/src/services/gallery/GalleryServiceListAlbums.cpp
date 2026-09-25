#include "services/DbError.h"
#include "services/GalleryService.h"

namespace pyracms {

void GalleryService::listAlbums(const DbClientPtr &db, int tenantId,
                                AlbumListCallback cb) {
    db->execSqlAsync(
        "SELECT a.*, "
        "(SELECT file_uuid FROM gallery_pictures "
        "WHERE id = a.default_picture_id) AS cover_uuid, "
        "COALESCE(p.cnt, 0) AS picture_count "
        "FROM gallery_albums a "
        "LEFT JOIN (SELECT album_id, COUNT(*) AS cnt FROM gallery_pictures "
        "GROUP BY album_id) p "
        "ON a.id = p.album_id "
        "WHERE a.tenant_id = $1 "
        "ORDER BY a.created_at DESC",
        [this, cb](const drogon::orm::Result &result) {
            std::vector<GalleryAlbumDto> albums;
            albums.reserve(result.size());
            for (const auto &row : result) {
                albums.push_back(albumRowToDto(row));
            }
            cb(albums);
        },
        [cb](const drogon::orm::DrogonDbException &) { cb({}); }, tenantId);
}

} // namespace pyracms
