#include "controllers/GalleryController.h"
#include "filters/TenantGuard.h"
#include "security/Validate.h"

namespace pyracms {

namespace {
bool oneOf(const std::string &v, std::initializer_list<const char *> ok) {
    if (v.empty())
        return true; // left out = unchanged
    for (const char *o : ok)
        if (v == o)
            return true;
    return false;
}
} // namespace

// Title and description are required; privacy, picture order, the chosen
// cover picture and cover mode (chosen | random) are optional and left as
// they are when missing.
void GalleryController::updateAlbum(
    const drogon::HttpRequestPtr &req,
    std::function<void(const drogon::HttpResponsePtr &)> &&callback, int id) {
    auto json = req->getJsonObject();
    if (!json || !(*json).isMember("displayName"))
        return callback(
            filterError("displayName required", drogon::k400BadRequest));

    auto displayName = (*json)["displayName"].asString();
    auto description = (*json).get("description", "").asString();
    if (displayName.size() > 256 || !isBoundedText(displayName, 256) ||
        !isBoundedText(description, 5000))
        return callback(filterError("Name or description is invalid",
                                    drogon::k400BadRequest));

    int isPrivate = (*json)["isPrivate"].isBool()
                        ? ((*json)["isPrivate"].asBool() ? 1 : 0)
                        : -1;
    auto sortOrder = (*json).get("sortOrder", "").asString();
    auto coverMode = (*json).get("coverMode", "").asString();
    if (!oneOf(sortOrder, {"newest", "oldest", "title"}) ||
        !oneOf(coverMode, {"chosen", "random"}))
        return callback(filterError(
            "sortOrder is newest, oldest or title; coverMode is chosen or "
            "random",
            drogon::k400BadRequest));
    int coverId = (*json)["defaultPictureId"].isIntegral()
                      ? (*json)["defaultPictureId"].asInt()
                      : -1;

    galleryService_.updateAlbum(
        drogon::app().getDbClient(), id, displayName, description, isPrivate,
        sortOrder, coverId, coverMode,
        [callback](bool success, const std::string &error) {
            Json::Value result;
            if (!success) {
                result["error"] = error;
                auto resp = drogon::HttpResponse::newHttpJsonResponse(result);
                resp->setStatusCode(drogon::k500InternalServerError);
                return callback(resp);
            }
            result["success"] = true;
            callback(drogon::HttpResponse::newHttpJsonResponse(result));
        });
}

} // namespace pyracms
