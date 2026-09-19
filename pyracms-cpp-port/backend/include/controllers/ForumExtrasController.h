#pragma once

#include "controllers/HttpAliases.h"

#include <drogon/HttpController.h>

namespace pyracms {

// Forum reactions, thread moves and per-user forum statistics.
class ForumExtrasController
    : public drogon::HttpController<ForumExtrasController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(ForumExtrasController::react,
                  "/api/forum/posts/{id}/reactions", drogon::Put, PYR_JWT);
    ADD_METHOD_TO(ForumExtrasController::unreact,
                  "/api/forum/posts/{id}/reactions/{emoji}", drogon::Delete,
                  PYR_JWT);
    ADD_METHOD_TO(ForumExtrasController::moveThread,
                  "/api/forum/threads/{id}/move", drogon::Put, PYR_JWT);
    ADD_METHOD_TO(ForumExtrasController::userStats,
                  "/api/forum/users/{id}/stats", drogon::Get);
    METHOD_LIST_END

    void react(HttpReq req, HttpCbRef callback, int id);
    void unreact(HttpReq req, HttpCbRef callback, int id, HttpStr emoji);
    void moveThread(HttpReq req, HttpCbRef callback, int id);
    void userStats(HttpReq req, HttpCbRef callback, int id);
};

} // namespace pyracms
