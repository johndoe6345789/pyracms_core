#include "services/GameDepService.h"
#include "services/DbError.h"

namespace pyracms {

void GameDepAttachService::addScreenshot(
    const GdCtx &c, const std::string &type, const std::string &name,
    const Json::Value &body, GdCb cb) {
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            gdFileId(
                c, body,
                [=](int fileId) {
                    c.db->execSqlAsync(
                        "WITH s AS (INSERT INTO gamedep_screenshots "
                        "(page_id, file_id, position, is_default) "
                        "VALUES ($1, $2, (SELECT COALESCE(MAX(position), "
                        "0) + 1 FROM gamedep_screenshots WHERE page_id = "
                        "$1), $3) ON CONFLICT (page_id, file_id) DO "
                        "UPDATE SET is_default = "
                        "gamedep_screenshots.is_default OR $3 "
                        "RETURNING id), "
                        "d AS (UPDATE gamedep_screenshots SET is_default "
                        "= FALSE WHERE page_id = $1 AND file_id <> $2 "
                        "AND $3) "
                        "SELECT id FROM s",
                        [cb](const drogon::orm::Result &r) {
                            GdResult out = gdOk(201);
                            out.body["id"] = r[0]["id"].as<int>();
                            cb(out);
                        },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(gdDbError(dbError(e)));
                        },
                        pageId, fileId, body.get("default", false).asBool());
                },
                cb);
        },
        cb);
}

void GameDepAttachService::removeScreenshot(
    const GdCtx &c, const std::string &type, const std::string &name,
    int id, GdCb cb) {
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            c.db->execSqlAsync(
                "DELETE FROM gamedep_screenshots "
                "WHERE id = $1 AND page_id = $2",
                [cb](const drogon::orm::Result &r) {
                    cb(r.affectedRows()
                           ? gdOk()
                           : gdError(404, "Screenshot not found"));
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                id, pageId);
        },
        cb);
}

} // namespace pyracms
