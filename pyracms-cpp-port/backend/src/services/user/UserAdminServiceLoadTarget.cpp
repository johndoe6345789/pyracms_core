#include "services/UserAdminService.h"
#include "services/UserAdminSql.h"

#include <string>

namespace pyracms {

void UserAdminService::loadTarget(const DbClientPtr &db, int id, TargetCb cb,
                                  int actorId) {
    static const std::string sql =
        std::string("SELECT COALESCE(u.role, 1) AS role, u.banned, "
                    "COALESCE(u.tenant_id, 0) AS tenant_id, ") +
        kSiteOwnerSql + " AS site_owner, " + kLastAdminSql +
        " AS last_admin, "
        "EXISTS (SELECT 1 FROM tenants t WHERE t.id = u.tenant_id "
        "AND t.owner_id = $2::int) AS actor_owns, "
        "(u.role = 4 AND NOT EXISTS (SELECT 1 FROM users o "
        "WHERE o.role = 4 AND NOT o.banned AND o.id <> u.id)) AS last_owner "
        "FROM users u WHERE u.id = $1";
    db->execSqlAsync(
        sql,
        [cb, id](const drogon::orm::Result &r) {
            if (r.empty())
                return cb(std::nullopt, false);
            AdminTarget t;
            t.id = id;
            t.role = r[0]["role"].as<int>();
            t.tenant = r[0]["tenant_id"].as<int>();
            t.siteOwner = r[0]["site_owner"].as<bool>();
            t.lastAdmin = r[0]["last_admin"].as<bool>();
            t.lastPlatformOwner = r[0]["last_owner"].as<bool>();
            t.actorOwnsTenant = r[0]["actor_owns"].as<bool>();
            cb(t, r[0]["banned"].as<bool>());
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb(std::nullopt, false);
        },
        id, actorId);
}

} // namespace pyracms
