#pragma once

#include "controllers/GameDepController.h"

namespace pyracms {

#define GD_PAGE "/api/gamedep/{type}/{name}"

// Dependencies, pip requirements, tags, screenshots and votes.
class GameDepAttachController
    : public drogon::HttpController<GameDepAttachController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(GameDepAttachController::addDependency,
                  GD_PAGE "/dependencies", drogon::Post,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepAttachController::removeDependency,
                  GD_PAGE "/dependencies/{id}", drogon::Delete,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepAttachController::setPip, GD_PAGE "/pip",
                  drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepAttachController::setTags, GD_PAGE "/tags",
                  drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepAttachController::addScreenshot,
                  GD_PAGE "/screenshots", drogon::Post,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepAttachController::removeScreenshot,
                  GD_PAGE "/screenshots/{id}", drogon::Delete,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepAttachController::vote, GD_PAGE "/vote",
                  drogon::Post, "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void addDependency(HttpReq r, HttpCb2 cb, Str t, Str n);
    void removeDependency(HttpReq r, HttpCb2 cb, Str t, Str n, int id);
    void setPip(HttpReq r, HttpCb2 cb, Str t, Str n);
    void setTags(HttpReq r, HttpCb2 cb, Str t, Str n);
    void addScreenshot(HttpReq r, HttpCb2 cb, Str t, Str n);
    void removeScreenshot(HttpReq r, HttpCb2 cb, Str t, Str n, int id);
    void vote(HttpReq r, HttpCb2 cb, Str t, Str n);

private:
    GameDepAttachService attach_;
};

} // namespace pyracms
