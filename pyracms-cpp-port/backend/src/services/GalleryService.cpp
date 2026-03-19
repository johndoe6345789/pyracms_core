#include "services/GalleryService.h"

namespace pyracms {

GalleryAlbumDto GalleryService::albumRowToDto(const drogon::orm::Row &row) {
    GalleryAlbumDto dto;
    dto.id = row["id"].as<int>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.description = row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.isPrivate = row["is_private"].as<bool>();
    dto.isProtected = row["is_protected"].as<bool>();
    dto.userId = row["user_id"].as<int>();
    dto.defaultPictureId = row["default_picture_id"].isNull() ? 0 : row["default_picture_id"].as<int>();
    dto.pictureCount = row["picture_count"].isNull() ? 0 : row["picture_count"].as<int>();
    return dto;
}

GalleryPictureDto GalleryService::pictureRowToDto(const drogon::orm::Row &row) {
    GalleryPictureDto dto;
    dto.id = row["id"].as<int>();
    dto.displayName = row["display_name"].as<std::string>();
    dto.description = row["description"].isNull() ? "" : row["description"].as<std::string>();
    dto.createdAt = row["created_at"].as<std::string>();
    dto.isPrivate = row["is_private"].as<bool>();
    dto.albumId = row["album_id"].as<int>();
    dto.fileUuid = row["file_uuid"].as<std::string>();
    dto.userId = row["user_id"].as<int>();
    return dto;
}

void GalleryService::listAlbums(const DbClientPtr &db, int tenantId,
                                 AlbumListCallback cb) {
    db->execSqlAsync(
        "SELECT a.*, COALESCE(p.cnt, 0) AS picture_count "
        "FROM gallery_albums a "
        "LEFT JOIN (SELECT album_id, COUNT(*) AS cnt FROM gallery_pictures GROUP BY album_id) p "
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
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId);
}

void GalleryService::createAlbum(const DbClientPtr &db, int tenantId,
                                  const std::string &displayName,
                                  const std::string &description,
                                  int userId,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gallery_albums (tenant_id, display_name, description, "
        "user_id, is_private, is_protected, created_at) "
        "VALUES ($1, $2, $3, $4, false, false, NOW()) "
        "RETURNING id",
        [cb](const drogon::orm::Result &result) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, displayName, description, userId);
}

void GalleryService::getAlbum(const DbClientPtr &db, int albumId,
                               AlbumDetailCallback cb) {
    db->execSqlAsync(
        "SELECT a.*, COALESCE(p.cnt, 0) AS picture_count "
        "FROM gallery_albums a "
        "LEFT JOIN (SELECT album_id, COUNT(*) AS cnt FROM gallery_pictures GROUP BY album_id) p "
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
                "ORDER BY created_at DESC",
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
                albumId);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        albumId);
}

void GalleryService::updateAlbum(const DbClientPtr &db, int albumId,
                                  const std::string &displayName,
                                  const std::string &description,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gallery_albums SET display_name = $1, description = $2 "
        "WHERE id = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        displayName, description, albumId);
}

void GalleryService::deleteAlbum(const DbClientPtr &db, int albumId,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM gallery_albums WHERE id = $1",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        albumId);
}

void GalleryService::addPicture(const DbClientPtr &db, int albumId,
                                 const std::string &displayName,
                                 const std::string &description,
                                 const std::string &fileUuid,
                                 int userId,
                                 BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gallery_pictures (album_id, display_name, description, "
        "file_uuid, user_id, is_private, created_at) "
        "VALUES ($1, $2, $3, $4, $5, false, NOW()) "
        "RETURNING id",
        [cb](const drogon::orm::Result &result) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        albumId, displayName, description, fileUuid, userId);
}

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
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt);
        },
        pictureId);
}

void GalleryService::updatePicture(const DbClientPtr &db, int pictureId,
                                    const std::string &displayName,
                                    const std::string &description,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gallery_pictures SET display_name = $1, description = $2 "
        "WHERE id = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        displayName, description, pictureId);
}

void GalleryService::deletePicture(const DbClientPtr &db, int pictureId,
                                    BoolCallback cb) {
    db->execSqlAsync(
        "DELETE FROM gallery_pictures WHERE id = $1",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        pictureId);
}

void GalleryService::setDefaultPicture(const DbClientPtr &db, int albumId,
                                        int pictureId,
                                        BoolCallback cb) {
    db->execSqlAsync(
        "UPDATE gallery_albums SET default_picture_id = $1 WHERE id = $2",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        pictureId, albumId);
}

void GalleryService::votePicture(const DbClientPtr &db, int pictureId,
                                  int userId, bool isLike,
                                  BoolCallback cb) {
    db->execSqlAsync(
        "INSERT INTO gallery_picture_votes (picture_id, user_id, is_like) "
        "VALUES ($1, $2, $3) "
        "ON CONFLICT (picture_id, user_id) "
        "DO UPDATE SET is_like = $3",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        pictureId, userId, isLike);
}

} // namespace pyracms
