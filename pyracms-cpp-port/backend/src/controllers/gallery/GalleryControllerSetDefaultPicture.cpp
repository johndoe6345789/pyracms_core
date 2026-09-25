#include "controllers/GalleryController.h"

namespace pyracms {

// The picture says which album it is in, so nothing needs to be sent.
void GalleryController::setDefaultPicture(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {
    galleryService_.setDefaultPicture(
        drogon::app().getDbClient(), id,
        [callback](bool success, const std::string &error) {
            Json::Value result;
            if (!success) {
                result["error"] = error;
                auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
                resp->setStatusCode(drogon::k404NotFound);
                return callback(resp);
            }
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
