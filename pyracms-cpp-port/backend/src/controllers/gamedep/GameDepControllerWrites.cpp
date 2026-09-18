#include "controllers/GameDepController.h"
#include "controllers/gamedep/GdHttp.h"

namespace pyracms {

void GameDepController::createPage(HttpReq req, HttpCb2 cb, Str type) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(type))
        return reply(gdBadType());
    writes_.createPage(gdWriteCtx(req), type, gdBody(req), reply);
}

void GameDepController::updatePage(HttpReq req, HttpCb2 cb, Str type,
                                   Str name) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(type))
        return reply(gdBadType());
    writes_.updatePage(gdWriteCtx(req), type, name, gdBody(req), reply);
}

void GameDepController::deletePage(HttpReq req, HttpCb2 cb, Str type,
                                   Str name) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(type))
        return reply(gdBadType());
    writes_.deletePage(gdWriteCtx(req), type, name, reply);
}

} // namespace pyracms
