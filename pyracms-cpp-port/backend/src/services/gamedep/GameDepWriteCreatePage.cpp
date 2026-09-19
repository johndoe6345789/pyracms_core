#include "services/GameDepService.h"
#include "services/DbError.h"
#include "services/gamedep/GdVisibility.h"
#include <regex>

namespace pyracms {

void GameDepWriteService::createPage(const GdCtx &c,
                                     const std::string &type,
                                     const Json::Value &body, GdCb cb) {
    std::string name = body.get("name", "").asString();
    static const std::regex ok("^[A-Za-z0-9._-]{1,128}$");
    if (!std::regex_match(name, ok)) {
        cb(gdError(400, "name required (letters, digits, . _ -)"));
        return;
    }
    bool priv = false;
    gdParseVisibility(body, priv);
    std::string display = body.get("displayName", name).asString();
    c.db->execSqlAsync(
        "INSERT INTO gamedep_pages (type, name, display_name, "
        "description, owner_id, tenant_id, is_private) "
        "VALUES ($1, $2, $3, $4, $5, NULLIF($6, 0), $7) RETURNING id",
        [cb](const drogon::orm::Result &r) {
            GdResult out = gdOk(201);
            out.body["id"] = r[0]["id"].as<int>();
            cb(out);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(gdDbError(dbError(e)));
        },
        type, name, display, body.get("description", "").asString(),
        c.userId, c.scope, priv);
}

} // namespace pyracms
