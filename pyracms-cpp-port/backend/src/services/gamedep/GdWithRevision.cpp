#include "services/gamedep/GdTypes.h"
#include "services/DbError.h"

namespace pyracms {

void gdWithRevision(const GdCtx &c, const std::string &type,
                    const std::string &name, const std::string &ver,
                    std::function<void(int pageId, int revId)> ok,
                    GdCb fail) {
    gdWithPage(
        c, type, name, true,
        [=](int pageId) {
            c.db->execSqlAsync(
                "SELECT id FROM gamedep_revisions "
                "WHERE page_id = $1 AND version = $2",
                [=](const drogon::orm::Result &r) {
                    if (r.empty()) {
                        fail(gdError(404, "Revision not found"));
                        return;
                    }
                    ok(pageId, r[0]["id"].as<int>());
                },
                [fail](const drogon::orm::DrogonDbException &e) {
                    fail(gdDbError(dbError(e)));
                },
                pageId, ver);
        },
        fail);
}

} // namespace pyracms
