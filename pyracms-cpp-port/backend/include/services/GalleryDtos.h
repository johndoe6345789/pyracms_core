#pragma once

#include <string>
#include <vector>

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
    std::string sortOrder;     // newest | oldest | title
    std::string coverFileUuid; // the cover picture's file, "" if none
    std::string coverMode;     // chosen | random
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

} // namespace pyracms
