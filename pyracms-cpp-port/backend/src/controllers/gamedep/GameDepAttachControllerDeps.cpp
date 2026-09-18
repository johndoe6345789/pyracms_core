#include "controllers/GameDepAttachController.h"
#include "controllers/gamedep/GdHttp.h"

namespace pyracms {

void GameDepAttachController::addDependency(HttpReq r, HttpCb2 cb, Str t,
                                            Str n) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.addDependency(gdWriteCtx(r), t, n, gdBody(r), reply);
}

void GameDepAttachController::removeDependency(HttpReq r, HttpCb2 cb,
                                               Str t, Str n, int id) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.removeDependency(gdWriteCtx(r), t, n, id, reply);
}

void GameDepAttachController::setPip(HttpReq r, HttpCb2 cb, Str t,
                                     Str n) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.setPip(gdWriteCtx(r), t, n, gdBody(r), reply);
}

} // namespace pyracms
