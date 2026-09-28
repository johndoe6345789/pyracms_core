#pragma once

#include "controllers/HttpAliases.h"
#include "services/VideoService.h"

#include <drogon/HttpController.h>

namespace pyracms {

// A site's video library: upload metadata, watch pages, likes.
// Comments use /api/comments/video/{id}; subscribing is following.
class VideoController : public drogon::HttpController<VideoController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(VideoController::list, "/api/videos", drogon::Get);
    ADD_METHOD_TO(VideoController::create, "/api/videos", drogon::Post,
                  PYR_JWT);
    ADD_METHOD_TO(VideoController::get, "/api/videos/{id}", drogon::Get);
    ADD_METHOD_TO(VideoController::update, "/api/videos/{id}", drogon::Put,
                  PYR_JWT, PYR_OWNER);
    ADD_METHOD_TO(VideoController::remove, "/api/videos/{id}", drogon::Delete,
                  PYR_JWT, PYR_OWNER);
    ADD_METHOD_TO(VideoController::vote, "/api/videos/{id}/vote", drogon::Post,
                  PYR_JWT);
    ADD_METHOD_TO(VideoController::clearVote, "/api/videos/{id}/vote",
                  drogon::Delete, PYR_JWT);
    METHOD_LIST_END

    void list(HttpReq req, HttpCbRef callback);
    void create(HttpReq req, HttpCbRef callback);
    void get(HttpReq req, HttpCbRef callback, int id);
    void update(HttpReq req, HttpCbRef callback, int id);
    void remove(HttpReq req, HttpCbRef callback, int id);
    void vote(HttpReq req, HttpCbRef callback, int id);
    void clearVote(HttpReq req, HttpCbRef callback, int id);

  private:
    void castVote(HttpReq req, HttpCb callback, int id,
                  std::optional<bool> isLike);
    VideoService videos_;
};

} // namespace pyracms
