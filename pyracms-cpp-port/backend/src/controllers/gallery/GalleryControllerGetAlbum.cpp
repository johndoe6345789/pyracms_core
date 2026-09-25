#include "controllers/GalleryController.h"
#include "security/Validate.h"

namespace pyracms {

void GalleryController::getAlbum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto db = drogon::app().getDbClient();
    galleryService_.getAlbum(
        db, id, [callback](const std::optional<GalleryAlbumDetailDto> &detail) {
            if (!detail) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Album not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = detail->album.id;
            result["displayName"] = detail->album.displayName;
            result["description"] = detail->album.description;
            result["createdAt"] = detail->album.createdAt;
            result["isPrivate"] = detail->album.isPrivate;
            result["isProtected"] = detail->album.isProtected;
            result["userId"] = detail->album.userId;
            result["defaultPictureId"] = detail->album.defaultPictureId;
            result["pictureCount"] = detail->album.pictureCount;
            result["sortOrder"] = detail->album.sortOrder;
            result["coverFileUuid"] = detail->album.coverFileUuid;

            Json::Value pictures(Json::arrayValue);
            for (const auto &p : detail->pictures) {
                Json::Value pic;
                pic["id"] = p.id;
                pic["displayName"] = p.displayName;
                pic["description"] = p.description;
                pic["createdAt"] = p.createdAt;
                pic["isPrivate"] = p.isPrivate;
                pic["albumId"] = p.albumId;
                pic["fileUuid"] = p.fileUuid;
                pic["userId"] = p.userId;
                pictures.append(pic);
            }
            result["pictures"] = pictures;

            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
