#include "controllers/GalleryController.h"
#include "security/Validate.h"

namespace pyracms {

void GalleryController::setDefaultPicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("albumId")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "albumId required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    int albumId = (*json)["albumId"].asInt();

    auto db = drogon::app().getDbClient();
    galleryService_.setDefaultPicture(
        db, albumId, id, [callback](bool success, const std::string &error) {
            if (!success) {
                auto resp =
                    drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
                (*resp->jsonObject())["error"] = error;
                resp->setStatusCode(drogon::k500InternalServerError);
                callback(resp);
                return;
            }

            Json::Value result;
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
