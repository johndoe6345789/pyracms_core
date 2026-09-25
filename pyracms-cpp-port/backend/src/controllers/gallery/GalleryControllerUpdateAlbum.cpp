#include "controllers/GalleryController.h"
#include "security/Validate.h"

namespace pyracms {

void GalleryController::updateAlbum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {

    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("displayName")) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*resp->jsonObject())["error"] = "displayName required";
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

    // Optional extras; anything left out is kept as it is.
    int isPrivate = (*json)["isPrivate"].isBool()
                        ? ((*json)["isPrivate"].asBool() ? 1 : 0)
                        : -1;
    auto sortOrder = (*json).get("sortOrder", "").asString();
    if (!sortOrder.empty() && sortOrder != "newest" && sortOrder != "oldest" &&
        sortOrder != "title") {
        auto bad = drogon::HttpResponse::newHttpJsonResponse(Json::Value{});
        (*bad->jsonObject())["error"] = "sortOrder must be newest, oldest "
                                        "or title";
        bad->setStatusCode(drogon::k400BadRequest);
        return callback(bad);
    }
    int coverId = (*json)["defaultPictureId"].isIntegral()
                      ? (*json)["defaultPictureId"].asInt()
                      : -1;

    auto db = drogon::app().getDbClient();
    galleryService_.updateAlbum(
        db, id, displayName, description, isPrivate, sortOrder, coverId,
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
