#include "services/GameDepService.h"

namespace pyracms {

void GameDepWriteService::createRevision(const GdCtx &c,
                                         const std::string &type,
                                         const std::string &name,
                                         const Json::Value &body,
                                         GdCb cb) {
    std::string ver = body.get("version", "").asString();
    if (ver.empty()) {
        cb(gdError(400, "version required"));
        return;
    }
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            c.db->execSqlAsync(
                "INSERT INTO gamedep_revisions (page_id, version, "
                "module_type, executable) VALUES ($1, $2, $3, $4) "
                "RETURNING id",
                [cb](const drogon::orm::Result &r) {
                    GdResult out = gdOk(201);
                    out.body["id"] = r[0]["id"].as<int>();
                    cb(out);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(e.base().what()));
                },
                pageId, ver, body.get("moduleType", "").asString(),
                body.get("executable", "").asString());
        },
        cb);
}

} // namespace pyracms
