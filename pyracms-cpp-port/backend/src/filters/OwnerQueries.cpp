#include "filters/OwnerFilter.h"

#include <drogon/drogon.h>

namespace pyracms {

// $1 key, $2 named tenant, $3 acting user. Columns: owner_id, tenant_id,
// site_owner (does $3 own the site the row lives in).
static const char *sqlFor(Resource kind) {
    switch (kind) {
    case Resource::Article:
        return "SELECT COALESCE(a.user_id, 0) AS owner_id, "
               "COALESCE(a.tenant_id, 0) AS tenant_id, EXISTS (SELECT 1 "
               "FROM tenants t WHERE t.id = a.tenant_id AND t.owner_id = "
               "$3::int) AS site_owner FROM articles a "
               "WHERE a.name = $1::text AND a.tenant_id = $2::int";
    case Resource::Album:
        return "SELECT COALESCE(a.user_id, 0) AS owner_id, "
               "COALESCE(a.tenant_id, 0) AS tenant_id, EXISTS (SELECT 1 "
               "FROM tenants t WHERE t.id = a.tenant_id AND t.owner_id = "
               "$3::int) AS site_owner FROM gallery_albums a "
               "WHERE a.id = $1::int AND $2::int >= 0";
    case Resource::Picture:
        return "SELECT CASE WHEN a.user_id = $3::int THEN a.user_id "
               "ELSE COALESCE(p.user_id, 0) END AS owner_id, "
               "COALESCE(a.tenant_id, 0) AS tenant_id, EXISTS (SELECT 1 "
               "FROM tenants t WHERE t.id = a.tenant_id AND t.owner_id = "
               "$3::int) AS site_owner FROM gallery_pictures p "
               "JOIN gallery_albums a ON a.id = p.album_id "
               "WHERE p.id = $1::int AND $2::int >= 0";
    case Resource::Webhook:
        return "SELECT 0 AS owner_id, w.tenant_id, EXISTS (SELECT 1 FROM "
               "tenants t WHERE t.id = w.tenant_id AND t.owner_id = "
               "$3::int) AS site_owner FROM webhooks w "
               "WHERE w.id = $1::int AND $2::int >= 0";
    default:
        return "SELECT COALESCE(f.user_id, 0) AS owner_id, "
               "COALESCE(f.tenant_id, 0) AS tenant_id, false AS site_owner "
               "FROM files f WHERE f.uuid = $1::text AND $2::int >= 0 "
               "AND $3::int >= 0";
    }
}

OwnerFilter::RowLookup &OwnerFilter::rowLookup() {
    static RowLookup lookup = [](Resource kind, const std::string &key,
                                 int tenant, int actor, RowCb cb) {
        drogon::app().getDbClient()->execSqlAsync(
            sqlFor(kind),
            [cb](const drogon::orm::Result &r) {
                if (r.empty())
                    return cb(true, std::nullopt);
                OwnedRow row;
                row.ownerId = r[0]["owner_id"].as<int>();
                row.tenantId = r[0]["tenant_id"].as<int>();
                row.siteOwner = r[0]["site_owner"].as<bool>();
                cb(true, row);
            },
            [cb](const drogon::orm::DrogonDbException &) {
                cb(false, std::nullopt);
            },
            key, tenant, actor);
    };
    return lookup;
}

} // namespace pyracms
