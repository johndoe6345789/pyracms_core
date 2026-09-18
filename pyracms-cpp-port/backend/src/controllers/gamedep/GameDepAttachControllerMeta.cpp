#include "controllers/GameDepAttachController.h"
#include "controllers/gamedep/GdHttp.h"

namespace pyracms {

void GameDepAttachController::setTags(HttpReq r, HttpCb2 cb, Str t,
                                      Str n) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.setTags(gdWriteCtx(r), t, n, gdBody(r), reply);
}

void GameDepAttachController::addScreenshot(HttpReq r, HttpCb2 cb, Str t,
                                            Str n) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.addScreenshot(gdWriteCtx(r), t, n, gdBody(r), reply);
}

void GameDepAttachController::removeScreenshot(HttpReq r, HttpCb2 cb,
                                               Str t, Str n, int id) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.removeScreenshot(gdWriteCtx(r), t, n, id, reply);
}

void GameDepAttachController::vote(HttpReq r, HttpCb2 cb, Str t, Str n) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.vote(gdWriteCtx(r), t, n, gdBody(r), reply);
}

} // namespace pyracms
