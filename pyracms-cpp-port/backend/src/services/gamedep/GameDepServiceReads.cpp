#include "services/GameDepService.h"
#include "services/gamedep/GdQuery.h"

namespace pyracms {

void GameDepService::listPages(const GdCtx &c, const ListQuery &q,
                               GdCb cb) {
    GdPageFilter f;
    f.type = q.type;
    f.q = q.q;
    f.tag = q.tag;
    f.limit = std::max(1, std::min(q.limit, 200));
    f.offset = std::max(0, q.offset);
    gdQueryPages(
        c, f,
        [cb](const GdPages &pages) {
            GdResult r;
            r.body = Json::Value(Json::arrayValue);
            for (const auto &p : pages)
                r.body.append(p);
            cb(r);
        },
        cb);
}

void GameDepService::getPage(const GdCtx &c, const std::string &type,
                             const std::string &name, GdCb cb) {
    GdPageFilter f;
    f.type = type;
    f.name = name;
    f.limit = 1;
    gdQueryPages(
        c, f,
        [cb](const GdPages &pages) {
            if (pages.empty()) {
                cb(gdError(404, "Page not found"));
                return;
            }
            GdResult r;
            r.body = pages[0];
            cb(r);
        },
        cb);
}

} // namespace pyracms
