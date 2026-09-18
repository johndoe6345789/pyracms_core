#pragma once

#include "controllers/GameDepController.h"

namespace pyracms {

#define GD_REV "/api/gamedep/{type}/{name}/revisions"

// Revisions of a page and their source/binary attachments.
class GameDepRevisionController
    : public drogon::HttpController<GameDepRevisionController> {
public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(GameDepRevisionController::createRevision, GD_REV,
                  drogon::Post, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepRevisionController::updateRevision,
                  GD_REV "/{ver}", drogon::Put, "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepRevisionController::deleteRevision,
                  GD_REV "/{ver}", drogon::Delete,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepRevisionController::togglePublish,
                  GD_REV "/{ver}/publish", drogon::Post,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepRevisionController::uploadSource,
                  GD_REV "/{ver}/source", drogon::Post,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepRevisionController::addBinary,
                  GD_REV "/{ver}/binaries", drogon::Post,
                  "pyracms::JwtAuthFilter");
    ADD_METHOD_TO(GameDepRevisionController::deleteBinary,
                  GD_REV "/{ver}/binaries/{id}", drogon::Delete,
                  "pyracms::JwtAuthFilter");
    METHOD_LIST_END

    void createRevision(HttpReq req, HttpCb2 cb, Str type, Str name);
    void updateRevision(HttpReq r, HttpCb2 cb, Str t, Str n, Str ver);
    void deleteRevision(HttpReq r, HttpCb2 cb, Str t, Str n, Str ver);
    void togglePublish(HttpReq r, HttpCb2 cb, Str t, Str n, Str ver);
    void uploadSource(HttpReq r, HttpCb2 cb, Str t, Str n, Str ver);
    void addBinary(HttpReq r, HttpCb2 cb, Str t, Str n, Str ver);
    void deleteBinary(HttpReq r, HttpCb2 cb, Str t, Str n, Str ver,
                      int id);

private:
    GameDepWriteService writes_;
    GameDepAttachService attach_;
};

} // namespace pyracms
