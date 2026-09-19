#include "filters/RoleRules.h"
#include "services/DbError.h"
#include "services/gamedep/GdTypes.h"

namespace pyracms {

void gdWithPage(const GdCtx &c, const std::string &type,
                const std::string &name, bool write,
                std::function<void(int pageId)> ok, GdCb fail) {
    c.db->execSqlAsync(
        "SELECT p.id, COALESCE(p.owner_id, 0) AS owner_id, "
        "COALESCE((SELECT role FROM users WHERE id = $4), 0) AS role, "
        "EXISTS (SELECT 1 FROM tenants t WHERE t.id = p.tenant_id "
        "AND t.owner_id = $4) AS site_owner "
        "FROM gamedep_pages p WHERE COALESCE(p.tenant_id, 0) = $1 "
        "AND p.type = $2 AND p.name = $3",
        [=](const drogon::orm::Result &r) {
            if (r.empty()) {
                fail(gdError(404, "Page not found"));
                return;
            }
            bool own = r[0]["owner_id"].as<int>() == c.userId;
            bool admin = roleAllows(r[0]["role"].as<int>(),
                                    UserRole::SiteAdmin) ||
                         r[0]["site_owner"].as<bool>();
            if (write && !own && !admin) {
                fail(gdError(403, "Not the owner of this page"));
                return;
            }
            ok(r[0]["id"].as<int>());
        },
        [fail](const drogon::orm::DrogonDbException &e) {
            fail(gdDbError(dbError(e)));
        },
        c.scope, type, name, c.userId);
}

} // namespace pyracms
