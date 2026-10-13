#include "controllers/VideoController.h"
#include "controllers/VideoJson.h"
#include "filters/TenantGuard.h"

namespace pyracms {

void VideoController::vote(HttpReq req, HttpCbRef callback, int id) {
    auto json = req->getJsonObject();
    if (!json || !json->isObject() || !(*json)["isLike"].isBool())
        return callback(filterError("isLike (true/false) is required",
                                    drogon::k400BadRequest));
    castVote(req, std::move(callback), id, (*json)["isLike"].asBool());
}

// Takes back a like or dislike (clicking the active thumb again).
void VideoController::clearVote(HttpReq req, HttpCbRef callback, int id) {
    castVote(req, std::move(callback), id, std::nullopt);
}

void VideoController::castVote(HttpReq req, HttpCb callback, int id,
                               std::optional<bool> isLike) {
    int userId = req->attributes()->get<int>("userId");
    videos_.vote(
        drogon::app().getDbClient(), id, userId, tokenTenantOf(req), isLike,
        [callback](bool ok, const VoteTally &t, const std::string &error) {
            if (ok)
                return callback(
                    drogon::HttpResponse::newHttpJsonResponse(tallyJson(t)));
            callback(filterError(error, error == "Not found"
                                            ? drogon::k404NotFound
                                            : drogon::k400BadRequest));
        });
}

} // namespace pyracms
