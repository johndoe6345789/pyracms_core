#include "controllers/GameDepRevisionController.h"
#include "controllers/gamedep/GdHttp.h"

namespace pyracms {

void GameDepRevisionController::createRevision(HttpReq req, HttpCb2 cb,
                                               Str type, Str name) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(type))
        return reply(gdBadType());
    writes_.createRevision(gdWriteCtx(req), type, name, gdBody(req),
                           reply);
}

void GameDepRevisionController::updateRevision(HttpReq r, HttpCb2 cb,
                                               Str t, Str n, Str ver) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    writes_.updateRevision(gdWriteCtx(r), t, n, ver, gdBody(r), reply);
}

void GameDepRevisionController::deleteRevision(HttpReq r, HttpCb2 cb,
                                               Str t, Str n, Str ver) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    writes_.deleteRevision(gdWriteCtx(r), t, n, ver, reply);
}

void GameDepRevisionController::togglePublish(HttpReq r, HttpCb2 cb,
                                              Str t, Str n, Str ver) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    writes_.togglePublish(gdWriteCtx(r), t, n, ver, reply);
}

void GameDepRevisionController::uploadSource(HttpReq r, HttpCb2 cb,
                                             Str t, Str n, Str ver) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    writes_.uploadSource(gdWriteCtx(r), t, n, ver, gdBody(r), reply);
}

} // namespace pyracms
