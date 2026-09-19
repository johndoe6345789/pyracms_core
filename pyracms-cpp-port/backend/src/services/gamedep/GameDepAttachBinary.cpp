#include "services/GameDepService.h"
#include "services/DbError.h"

namespace pyracms {

void GameDepAttachService::addBinary(
    const GdCtx &c, const std::string &type, const std::string &name,
    const std::string &ver, const Json::Value &body, GdCb cb) {
    gdWithRevision(
        c, type, name, ver,
        [=](int, int revId) {
            gdFileId(
                c, body,
                [=](int fileId) {
                    c.db->execSqlAsync(
                        "INSERT INTO gamedep_binaries (revision_id, "
                        "os_id, arch_id, file_id, sha256, executable) "
                        "SELECT $1, o.id, a.id, $2, $3, $4 "
                        "FROM operating_systems o, architectures a "
                        "WHERE (o.id = $5 OR o.name = $6) "
                        "AND (a.id = $7 OR a.name = $8) RETURNING id",
                        [cb](const drogon::orm::Result &r) {
                            if (r.empty()) {
                                cb(gdError(400, "Unknown os or arch"));
                                return;
                            }
                            GdResult out = gdOk(201);
                            out.body["id"] = r[0]["id"].as<int>();
                            cb(out);
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(gdDbError(dbError(e)));
                        },
                        revId, fileId, body.get("sha256", "").asString(),
                        body.get("executable", "").asString(),
                        body.get("osId", 0).asInt(),
                        body.get("os", "").asString(),
                        body.get("archId", 0).asInt(),
                        body.get("arch", "").asString());
                },
                cb);
        },
        cb);
}

void GameDepAttachService::deleteBinary(
    const GdCtx &c, const std::string &type, const std::string &name,
    const std::string &ver, int id, GdCb cb) {
    gdWithRevision(
        c, type, name, ver,
        [=](int, int revId) {
            c.db->execSqlAsync(
                "DELETE FROM gamedep_binaries "
                "WHERE id = $1 AND revision_id = $2",
                [cb](const drogon::orm::Result &r) {
                    cb(r.affectedRows() ? gdOk()
                                        : gdError(404, "Binary not found"));
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                id, revId);
        },
        cb);
}

} // namespace pyracms
