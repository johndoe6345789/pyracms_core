#include "filters/RoleRules.h"
#include "services/gamedep/GdTypes.h"

namespace pyracms {

void gdWithPage(const GdCtx &c, const std::string &type,
                const std::string &name, bool write,
                std::function<void(int pageId)> ok, GdCb fail) {
    c.db->execSqlAsync(
        "SELECT p.id, COALESCE(p.owner_id, 0) AS owner_id, "
        "COALESCE((SELECT role FROM users WHERE id = $4), 0) AS role "
        "FROM gamedep_pages p WHERE COALESCE(p.tenant_id, 0) = $1 "
        "AND p.type = $2 AND p.name = $3",
        [=](const drogon::orm::Result &r) {
            if (r.empty()) {
                fail(gdError(404, "Page not found"));
                return;
            }
            bool own = r[0]["owner_id"].as<int>() == c.userId;
            bool admin = roleAllows(r[0]["role"].as<int>(),
                                    UserRole::SiteAdmin);
            if (write && !own && !admin) {
                fail(gdError(403, "Not the owner of this page"));
                return;
            }
            ok(r[0]["id"].as<int>());
        },
        [fail](const drogon::orm::DrogonDbException &e) {
            fail(gdDbError(e.base().what()));
        },
        c.scope, type, name, c.userId);
}

} // namespace pyracms
