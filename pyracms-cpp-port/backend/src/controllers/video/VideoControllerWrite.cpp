#include "controllers/VideoController.h"
#include "controllers/VideoJson.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "security/Validate.h"

namespace pyracms {

static void badRequest(const HttpCb &callback, const std::string &why) {
    callback(filterError(why, drogon::k400BadRequest));
}

void VideoController::create(HttpReq req, HttpCbRef callback) {
    auto json = req->getJsonObject();
    int tenantId = firstNamedTenant(namedTenants(req));
    if (!json || !json->isObject() || tenantId <= 0 ||
        !(*json)["fileUuid"].isString())
        return badRequest(callback, "tenantId and fileUuid are required");
    auto fileUuid = (*json)["fileUuid"].asString();
    if (!isValidUuid(fileUuid))
        return badRequest(callback, "fileUuid must be an uploaded file");
    VideoInput in;
    auto problem = applyVideoInput(*json, in);
    if (!problem.empty())
        return badRequest(callback, problem);
    int userId = req->attributes()->get<int>("userId");
    videos_.createVideo(
        drogon::app().getDbClient(), tenantId, userId, fileUuid, in,
        [callback](bool ok, int id, const std::string &error) {
            if (!ok)
                return badRequest(callback, error);
            Json::Value body;
            body["id"] = id;
            auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
            resp->setStatusCode(drogon::k201Created);
            callback(resp);
        });
}

// OwnerFilter has vetted the caller; unset members keep their values.
void VideoController::update(HttpReq req, HttpCbRef callback, int id) {
    auto json = req->getJsonObject();
    if (!json)
        return badRequest(callback, "A JSON object is required");
    auto db = drogon::app().getDbClient();
    VideoLookup look;
    look.anyVisibility = true;
    videos_.getVideo(
        db, id, look,
        [this, db, id, body = *json,
         callback](const std::optional<VideoDto> &v) {
            if (!v)
                return callback(filterError("Not found", drogon::k404NotFound));
            VideoInput in{v->title, v->description, v->thumbnailUuid,
                          v->durationSeconds, v->visibility};
            auto problem = applyVideoInput(body, in);
            if (!problem.empty())
                return badRequest(callback, problem);
            videos_.updateVideo(db, id, in, boolReply(callback));
        });
}

void VideoController::remove(HttpReq req, HttpCbRef callback, int id) {
    videos_.deleteVideo(drogon::app().getDbClient(), id,
                        boolReply(std::move(callback)));
}

} // namespace pyracms
