#include "services/GameDepService.h"
#include "services/DbError.h"
#include "services/gamedep/GdPip.h"

namespace pyracms {

void GameDepAttachService::setPip(const GdCtx &c, const std::string &type,
                                  const std::string &name,
                                  const Json::Value &body, GdCb cb) {
    Json::Value list(Json::arrayValue);
    const Json::Value &src = body["pipRequirements"];
    if (!src.isArray()) {
        cb(gdError(400, "pipRequirements array required"));
        return;
    }
    for (const auto &r : src) {
        auto nv = gdSplitRequirement(r.asString());
        if (nv.first.empty())
            continue;
        Json::Value o;
        o["n"] = nv.first;
        o["v"] = nv.second;
        list.append(o);
    }
    Json::FastWriter w;
    std::string json = w.write(list);
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            c.db->execSqlAsync(
                "DELETE FROM gamedep_dependencies "
                "WHERE game_id = $1 AND kind = 'pip'",
                [=](const drogon::orm::Result &) {
                    c.db->execSqlAsync(
                        "INSERT INTO gamedep_dependencies (game_id, kind, "
                        "name, version) SELECT DISTINCT ON (e->>'n', "
                        "e->>'v') $1, 'pip', e->>'n', e->>'v' "
                        "FROM jsonb_array_elements($2::text::jsonb) e",
                        [cb](const drogon::orm::Result &) { cb(gdOk()); },
                        [cb](const drogon::orm::DrogonDbException &e) {
                            cb(gdDbError(dbError(e)));
                        },
                        pageId, json);
                },
                [cb](const drogon::orm::DrogonDbException &e) {
                    cb(gdDbError(dbError(e)));
                },
                pageId);
        },
        cb);
}

} // namespace pyracms
