#include "controllers/GalleryController.h"
#include "security/Validate.h"

namespace pyracms {

void GalleryController::listAlbums(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto tenantIdStr = req->getParameter("tenant_id");
    if (tenantIdStr.empty()) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "tenant_id parameter required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int tenantId = std::stoi(tenantIdStr);
    auto db = drogon::app().getDbClient();
    galleryService_.listAlbums(
        db, tenantId, [callback](const std::vector<GalleryAlbumDto> &albums) {
            Json::Value result(Json::arrayValue);
            for (const auto &a : albums) {
                Json::Value item;
                item["id"] = a.id;
                item["displayName"] = a.displayName;
                item["description"] = a.description;
                item["createdAt"] = a.createdAt;
                item["isPrivate"] = a.isPrivate;
                item["isProtected"] = a.isProtected;
                item["userId"] = a.userId;
                item["defaultPictureId"] = a.defaultPictureId;
                item["pictureCount"] = a.pictureCount;
                item["sortOrder"] = a.sortOrder;
                item["coverFileUuid"] = a.coverFileUuid;
                item["coverMode"] = a.coverMode;
                result.append(item);
            }
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
