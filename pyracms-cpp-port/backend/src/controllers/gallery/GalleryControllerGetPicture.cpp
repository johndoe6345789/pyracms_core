#include "controllers/GalleryController.h"
#include "security/Validate.h"

namespace pyracms {

void GalleryController::getPicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto db = drogon::app().getDbClient();
    galleryService_.getPicture(
        db, id, [callback](const std::optional<GalleryPictureDto> &picture) {
            if (!picture) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = "Picture not found";
                resp->setStatusCode(drogon::k404NotFound);
                callback(resp);
                return;
            }

            Json::Value result;
            result["id"] = picture->id;
            result["displayName"] = picture->displayName;
            result["description"] = picture->description;
            result["createdAt"] = picture->createdAt;
            result["isPrivate"] = picture->isPrivate;
            result["albumId"] = picture->albumId;
            result["fileUuid"] = picture->fileUuid;
            result["userId"] = picture->userId;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
