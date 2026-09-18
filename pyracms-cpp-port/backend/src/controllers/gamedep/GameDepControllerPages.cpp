#include "controllers/GameDepController.h"
#include "controllers/gamedep/GdHttp.h"

namespace pyracms {

void GameDepController::listPages(HttpReq req, HttpCb2 cb, Str type) {
    auto reply = gdReply(std::move(cb));
    if (type == "catalog") {
        reads_.catalog(gdReadCtx(req), reply);
        return;
    }
    if (!gdValidType(type))
        return reply(gdBadType());
    GameDepService::ListQuery q;
    q.type = type;
    q.q = req->getParameter("q");
    q.tag = req->getParameter("tag");
    q.limit = gdInt(req->getParameter("limit"), 50);
    q.offset = gdInt(req->getParameter("offset"), 0);
    reads_.listPages(gdReadCtx(req), q, reply);
}

void GameDepController::getPage(HttpReq req, HttpCb2 cb, Str type,
                                Str name) {
    auto reply = gdReply(std::move(cb));
    if (!gdValidType(type))
        return reply(gdBadType());
    reads_.getPage(gdReadCtx(req), type, name, reply);
}

void GameDepController::getFullCatalog(HttpReq req, HttpCb2 cb) {
    reads_.catalog(gdReadCtx(req), gdReply(std::move(cb)));
}

void GameDepController::listOperatingSystems(HttpReq req, HttpCb2 cb) {
    reads_.listOperatingSystems(gdReadCtx(req), gdReply(std::move(cb)));
}

void GameDepController::listArchitectures(HttpReq req, HttpCb2 cb) {
    reads_.listArchitectures(gdReadCtx(req), gdReply(std::move(cb)));
}

} // namespace pyracms
