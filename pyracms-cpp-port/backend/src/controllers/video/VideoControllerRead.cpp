#include "controllers/QueryInt.h"
#include "controllers/VideoController.h"
#include "controllers/VideoJson.h"
#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "filters/UserVisibility.h"
#include "filters/Viewer.h"

namespace pyracms {

void VideoController::list(HttpReq req, HttpCbRef callback) {
    VideoQuery q;
    q.tenantId = queryInt(req->getParameter("tenant_id"), 0);
    if (q.tenantId <= 0)
        return callback(
            filterError("tenant_id is required", drogon::k400BadRequest));
    q.userId = queryInt(req->getParameter("user_id"), 0);
    q.viewerId = viewerIdFor(req, q.tenantId);
    q.text = req->getParameter("q");
    if (q.text.size() > 100)
        return callback(filterError("q is too long", drogon::k400BadRequest));
    q.popular = req->getParameter("sort") == "popular";
    q.limit = clampLimit(req->getParameter("limit"), 24, 100);
    q.offset = clampOffset(req->getParameter("offset"));
    videos_.listVideos(
        drogon::app().getDbClient(), q,
        [callback](const std::vector<VideoDto> &items, int total) {
            Json::Value body;
            body["total"] = total;
            body["items"] = Json::Value(Json::arrayValue);
            for (const auto &v : items)
                body["items"].append(videoJson(v));
            callback(drogon::HttpResponse::newHttpJsonResponse(body));
        });
}

// Watching counts a view. Private videos are for their uploader only.
void VideoController::get(HttpReq req, HttpCbRef callback, int id) {
    auto viewer = viewerOf(req);
    VideoLookup look;
    look.tenant =
        effectiveScope(viewer.tenantId, req->getParameter("tenant_id"));
    look.viewerId = viewer.userId;
    look.countView = true;
    videos_.getVideo(
        drogon::app().getDbClient(), id, look,
        [callback](const std::optional<VideoDto> &v) {
            if (!v)
                return callback(
                    filterError("Video not found", drogon::k404NotFound));
            auto body = videoJson(*v);
            body["myVote"] = v->myVote;
            callback(drogon::HttpResponse::newHttpJsonResponse(body));
        });
}

} // namespace pyracms
