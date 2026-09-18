#include "services/GameDepService.h"

namespace pyracms {

static void lookup(const GdCtx &c, const char *table, GdCb cb) {
    c.db->execSqlAsync(
        std::string("SELECT id, name, display_name FROM ") + table +
            " ORDER BY name",
        [cb](const drogon::orm::Result &r) {
            GdResult out;
            out.body = Json::Value(Json::arrayValue);
            for (const auto &row : r) {
                Json::Value i;
                i["id"] = row["id"].as<int>();
                i["name"] = row["name"].as<std::string>();
                i["displayName"] = row["display_name"].as<std::string>();
                out.body.append(i);
            }
            cb(out);
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(gdDbError(e.base().what()));
        });
}

void GameDepService::listOperatingSystems(const GdCtx &c, GdCb cb) {
    lookup(c, "operating_systems", cb);
}

void GameDepService::listArchitectures(const GdCtx &c, GdCb cb) {
    lookup(c, "architectures", cb);
}

} // namespace pyracms
