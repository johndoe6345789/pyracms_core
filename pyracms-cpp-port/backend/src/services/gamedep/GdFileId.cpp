#include "services/gamedep/GdTypes.h"
#include "services/DbError.h"

namespace pyracms {

void gdFileId(const GdCtx &c, const Json::Value &body,
              std::function<void(int fileId)> ok, GdCb fail) {
    std::string uuid = body.get("fileUuid", "").asString();
    int id = body.get("fileId", 0).asInt();
    if (uuid.empty() && id <= 0) {
        fail(gdError(400, "fileId or fileUuid required"));
        return;
    }
    c.db->execSqlAsync(
        "SELECT id FROM files WHERE id = $1 OR uuid = $2",
        [ok, fail](const drogon::orm::Result &r) {
            if (r.empty())
                fail(gdError(404, "File not found"));
            else
                ok(r[0]["id"].as<int>());
        },
        [fail](const drogon::orm::DrogonDbException &e) {
            fail(gdDbError(dbError(e)));
        },
        id, uuid);
}

} // namespace pyracms
