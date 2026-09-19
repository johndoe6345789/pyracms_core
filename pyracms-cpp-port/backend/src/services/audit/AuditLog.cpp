#include "services/AuditLog.h"

#include "filters/TenantGuard.h"

#include <drogon/drogon.h>

namespace pyracms {

void auditLog(int tenantId, int actorId, const std::string &action,
              const std::string &target) {
    drogon::app().getDbClient()->execSqlAsync(
        "INSERT INTO audit_log (tenant_id, actor_id, action, target) "
        "VALUES (NULLIF($1::int, 0), NULLIF($2::int, 0), $3, LEFT($4, 256))",
        [](const drogon::orm::Result &) {},
        [](const drogon::orm::DrogonDbException &) {}, tenantId, actorId,
        action, target);
}

void auditFromRequest(const drogon::HttpRequestPtr &req,
                      const std::string &action, const std::string &target) {
    auto attrs = req->attributes();
    int actor = attrs->find("userId") ? attrs->get<int>("userId") : 0;
    int tenant = attrs->find("auditTenant") ? attrs->get<int>("auditTenant")
                                            : scopeTenantOf(req);
    auditLog(tenant, actor, action, target);
}

} // namespace pyracms
