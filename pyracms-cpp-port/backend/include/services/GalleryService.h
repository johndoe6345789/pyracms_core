#pragma once

#include "services/GalleryDtos.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

class GalleryService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using AlbumCallback =
        std::function<void(const std::optional<GalleryAlbumDto> &)>;
    using AlbumDetailCallback =
        std::function<void(const std::optional<GalleryAlbumDetailDto> &)>;
    using AlbumListCallback =
        std::function<void(const std::vector<GalleryAlbumDto> &)>;
    using PictureCallback =
        std::function<void(const std::optional<GalleryPictureDto> &)>;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;
    void listAlbums(const DbClientPtr &db, int tenantId, AlbumListCallback cb);
    void createAlbum(const DbClientPtr &db, int tenantId,
                     const std::string &displayName,
                     const std::string &description, int userId,
                     BoolCallback cb);
    void getAlbum(const DbClientPtr &db, int albumId, AlbumDetailCallback cb);
    // isPrivate: -1 keep, 0/1 set. sortOrder "" keeps. coverId: -1 keeps,
    // 0 clears, else a picture of this album (others are ignored).
    void updateAlbum(const DbClientPtr &db, int albumId,
                     const std::string &displayName,
                     const std::string &description, int isPrivate,
                     const std::string &sortOrder, int coverId,
                     BoolCallback cb);
    void deleteAlbum(const DbClientPtr &db, int albumId, BoolCallback cb);
    void addPicture(const DbClientPtr &db, int albumId,
                    const std::string &displayName,
                    const std::string &description, const std::string &fileUuid,
                    int userId, BoolCallback cb);
    void getPicture(const DbClientPtr &db, int pictureId, PictureCallback cb);
    void updatePicture(const DbClientPtr &db, int pictureId,
                       const std::string &displayName,
                       const std::string &description, BoolCallback cb);
    void deletePicture(const DbClientPtr &db, int pictureId, BoolCallback cb);
    // Makes the picture its own album's cover (no such picture = failure).
    void setDefaultPicture(const DbClientPtr &db, int pictureId,
                           BoolCallback cb);
    void votePicture(const DbClientPtr &db, int pictureId, int userId,
                     bool isLike, BoolCallback cb);

  private:
    GalleryAlbumDto albumRowToDto(const drogon::orm::Row &row);
    GalleryPictureDto pictureRowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
