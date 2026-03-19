#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

struct GalleryAlbumDto {
    int id;
    std::string displayName;
    std::string description;
    std::string createdAt;
    bool isPrivate;
    bool isProtected;
    int userId;
    int defaultPictureId;
    int pictureCount;
};

struct GalleryPictureDto {
    int id;
    std::string displayName;
    std::string description;
    std::string createdAt;
    bool isPrivate;
    int albumId;
    std::string fileUuid;
    int userId;
};

struct GalleryAlbumDetailDto {
    GalleryAlbumDto album;
    std::vector<GalleryPictureDto> pictures;
};

class GalleryService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using AlbumCallback = std::function<void(const std::optional<GalleryAlbumDto> &)>;
    using AlbumDetailCallback = std::function<void(const std::optional<GalleryAlbumDetailDto> &)>;
    using AlbumListCallback = std::function<void(const std::vector<GalleryAlbumDto> &)>;
    using PictureCallback = std::function<void(const std::optional<GalleryPictureDto> &)>;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;

    void listAlbums(const DbClientPtr &db, int tenantId,
                    AlbumListCallback cb);

    void createAlbum(const DbClientPtr &db, int tenantId,
                     const std::string &displayName,
                     const std::string &description,
                     int userId,
                     BoolCallback cb);

    void getAlbum(const DbClientPtr &db, int albumId,
                  AlbumDetailCallback cb);

    void updateAlbum(const DbClientPtr &db, int albumId,
                     const std::string &displayName,
                     const std::string &description,
                     BoolCallback cb);

    void deleteAlbum(const DbClientPtr &db, int albumId,
                     BoolCallback cb);

    void addPicture(const DbClientPtr &db, int albumId,
                    const std::string &displayName,
                    const std::string &description,
                    const std::string &fileUuid,
                    int userId,
                    BoolCallback cb);

    void getPicture(const DbClientPtr &db, int pictureId,
                    PictureCallback cb);

    void updatePicture(const DbClientPtr &db, int pictureId,
                       const std::string &displayName,
                       const std::string &description,
                       BoolCallback cb);

    void deletePicture(const DbClientPtr &db, int pictureId,
                       BoolCallback cb);

    void setDefaultPicture(const DbClientPtr &db, int albumId, int pictureId,
                           BoolCallback cb);

    void votePicture(const DbClientPtr &db, int pictureId, int userId,
                     bool isLike,
                     BoolCallback cb);

private:
    GalleryAlbumDto albumRowToDto(const drogon::orm::Row &row);
    GalleryPictureDto pictureRowToDto(const drogon::orm::Row &row);
};

} // namespace pyracms
