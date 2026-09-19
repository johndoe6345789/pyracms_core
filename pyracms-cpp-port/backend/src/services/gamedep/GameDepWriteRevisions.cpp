#include "services/GameDepService.h"
#include "services/DbError.h"

namespace pyracms {

void GameDepWriteService::updateRevision(
    const GdCtx &c, const std::string &type, const std::string &name,
    const std::string &ver, const Json::Value &body, GdCb cb) {
    gdWithRevision(
        c, type, name, ver,
        [=](int, int revId) {
            c.db->execSqlAsync(
                "UPDATE gamedep_revisions SET "
                "version = COALESCE(NULLIF($2, ''), version), "
                "module_type = CASE WHEN $3 THEN $4 ELSE module_type "
                "END, executable = CASE WHEN $5 THEN $6 ELSE "
                "executable END WHERE id = $1",
                [cb](const drogon::orm::Result &) { cb(gdOk()); },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                revId, body.get("version", "").asString(),
                body.isMember("moduleType"),
                body.get("moduleType", "").asString(),
                body.isMember("executable"),
                body.get("executable", "").asString());
        },
        cb);
}

void GameDepWriteService::deleteRevision(
    const GdCtx &c, const std::string &type, const std::string &name,
    const std::string &ver, GdCb cb) {
    gdWithRevision(
        c, type, name, ver,
        [=](int, int revId) {
            c.db->execSqlAsync(
                "DELETE FROM gamedep_revisions WHERE id = $1",
                [cb](const drogon::orm::Result &) { cb(gdOk()); },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                revId);
        },
        cb);
}

} // namespace pyracms
