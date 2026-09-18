#include "controllers/GameDepRevisionController.h"
#include "controllers/gamedep/GdHttp.h"

namespace pyracms {

void GameDepRevisionController::addBinary(HttpReq r, HttpCb2 cb, Str t,
                                          Str n, Str ver) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.addBinary(gdWriteCtx(r), t, n, ver, gdBody(r), reply);
}

void GameDepRevisionController::deleteBinary(HttpReq r, HttpCb2 cb,
                                             Str t, Str n, Str ver,
                                             int id) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(t))
        return reply(gdBadType());
    attach_.deleteBinary(gdWriteCtx(r), t, n, ver, id, reply);
}

} // namespace pyracms
