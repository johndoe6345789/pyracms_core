#include "services/GameDepService.h"
#include "services/DbError.h"

namespace pyracms {

void GameDepWriteService::updatePage(const GdCtx &c,
                                     const std::string &type,
                                     const std::string &name,
                                     const Json::Value &body, GdCb cb) {
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            c.db->execSqlAsync(
                "UPDATE gamedep_pages SET "
                "display_name = CASE WHEN $2 THEN $3 ELSE display_name "
                "END, description = CASE WHEN $4 THEN $5 ELSE "
                "description END WHERE id = $1",
                [cb](const drogon::orm::Result &) { cb(gdOk()); },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                pageId, body.isMember("displayName"),
                body.get("displayName", "").asString(),
                body.isMember("description"),
                body.get("description", "").asString());
        },
        cb);
}

void GameDepWriteService::deletePage(const GdCtx &c,
                                     const std::string &type,
                                     const std::string &name, GdCb cb) {
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            c.db->execSqlAsync(
                "DELETE FROM gamedep_pages WHERE id = $1",
                [cb](const drogon::orm::Result &) { cb(gdOk()); },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                pageId);
        },
        cb);
}

} // namespace pyracms
