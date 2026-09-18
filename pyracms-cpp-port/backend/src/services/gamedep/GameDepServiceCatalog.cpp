#include "services/GameDepService.h"
#include "services/gamedep/GdQuery.h"

namespace pyracms {

void GameDepService::catalog(const GdCtx &c, GdCb cb) {
    GdPageFilter f;
    f.publishedOnly = true;
    f.limit = 1000;
    gdQueryPages(
        c, f,
        [cb](const GdPages &pages) {
            GdResult r;
            Json::Value list(Json::arrayValue);
            for (const auto &p : pages) {
                if (p["revisions"].empty())
                    continue;
                Json::Value wrap;
                bool game = p["type"].asString() == "game";
                wrap[game ? "game" : "dependency"] = p;
                list.append(wrap);
            }
            r.body["gamedep"] = list;
            cb(r);
        },
        cb);
}

} // namespace pyracms
