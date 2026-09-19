#include "controllers/GalleryController.h"
#include "security/Validate.h"

namespace pyracms {

void GalleryController::createAlbum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("displayName") ||
        !(*json).isMember("tenantId")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "displayName and tenantId required";
        resp->setStatusCode(drogon::k400BadRequest);
        callback(resp);
        return;
    }

    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).isMember("description")
                           ? (*json)["description"].asString()
                           : "";
    if (displayName.size() > 256 || !isBoundedText(displayName, 256) ||
        !isBoundedText(description, 5000)) {
        auto bad = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*bad->jsonObject())["error"] = "Name or description is invalid";
        bad->setStatusCode(drogon::k400BadRequest);
        callback(bad);
        return;
    }
    int tenantId = (*json)["tenantId"].asInt();
    int userId = req->attributes()->get<int>("userId");

    auto db = drogon::app().getDbClient();
    galleryService_.createAlbum(
        db, tenantId, displayName, description, userId,
        [callback](bool success, const std::string &error) {
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
