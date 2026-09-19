#include "services/GameDepService.h"
#include "services/DbError.h"

namespace pyracms {

void GameDepWriteService::togglePublish(
    const GdCtx &c, const std::string &type, const std::string &name,
    const std::string &ver, GdCb cb) {
    gdWithRevision(
        c, type, name, ver,
        [=](int, int revId) {
            c.db->execSqlAsync(
                "UPDATE gamedep_revisions SET published = NOT published "
                "WHERE id = $1 RETURNING published",
                [cb](const drogon::orm::Result &r) {
                    GdResult out = gdOk();
                    out.body["published"] = r[0]["published"].as<bool>();
                    cb(out);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                revId);
        },
        cb);
}

void GameDepWriteService::uploadSource(
    const GdCtx &c, const std::string &type, const std::string &name,
    const std::string &ver, const Json::Value &body, GdCb cb) {
    gdWithRevision(
        c, type, name, ver,
        [=](int, int revId) {
            gdFileId(
                c, body,
                [=](int fileId) {
                    c.db->execSqlAsync(
                        "UPDATE gamedep_revisions SET file_id = $1 "
                        "WHERE id = $2",
                        [cb](const drogon::orm::Result &) {
                            cb(gdOk());
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(gdDbError(dbError(e)));
                        },
                        fileId, revId);
                },
                cb);
        },
        cb);
}

} // namespace pyracms
