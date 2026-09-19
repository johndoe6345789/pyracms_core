#include "filters/OwnerFilter.h"

#include "filters/TenantGuard.h"
#include "security/Validate.h"

#include <drogon/drogon.h>
#include <sstream>

namespace pyracms {

Target targetOf(const std::string &path) {
    std::vector<std::string> seg;
    std::stringstream ss(path);
    std::string part;
    while (std::getline(ss, part, '/')) {
        if (!part.empty())
            seg.push_back(part);
    }
    // seg = api, <area>, [<sub>,] <key>, ...
    if (seg.size() < 3 || seg[0] != "api")
        return {};
    if (seg[1] == "articles")
        return {Resource::Article, seg[2]};
    if (seg[1] == "webhooks")
        return {Resource::Webhook, seg[2]};
    if (seg[1] == "files")
        return {Resource::File, seg[2]};
    if (seg[1] == "gallery" && seg.size() >= 4) {
        if (seg[2] == "albums")
            return {Resource::Album, seg[3]};
        if (seg[2] == "pictures")
            return {Resource::Picture, seg[3]};
    }
    return {};
}

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

void OwnerFilter::doFilter(const drogon::HttpRequestPtr &req,
                           drogon::FilterCallback &&fcb,
                           drogon::FilterChainCallback &&fccb) {
    auto attrs = req->attributes();
    auto target = targetOf(req->path());
    if (!attrs->find("userId") || target.kind == Resource::None) {
        fcb(filterError("Authentication required", drogon::k401Unauthorized));
        return;
    }
    int actor = attrs->get<int>("userId");
    int role = attrs->find("role") ? attrs->get<int>("role") : 0;
    int actorTenant = tokenTenantOf(req);
    int named = firstNamedTenant(namedTenants(req));
    bool byId = target.kind != Resource::Article &&
                target.kind != Resource::File;
    int idCheck = 0;
    if ((byId && !parseId(target.key, idCheck)) ||
        (target.kind == Resource::File && !isValidUuid(target.key))) {
        fcb(filterError("Not found", drogon::k404NotFound));
        return;
    }
    if (target.kind == Resource::Article && named == 0) {
        fcb(filterError("tenant_id is required", drogon::k400BadRequest));
        return;
    }
    rowLookup()(target.kind, target.key, named, actor,
                [=, fcb = std::move(fcb), fccb = std::move(fccb)](
                    bool ok, std::optional<OwnedRow> row) {
                    if (!ok) {
                        fcb(filterError("Authorisation unavailable",
                                        drogon::k503ServiceUnavailable));
                    } else if (!row) {
                        fcb(filterError("Not found", drogon::k404NotFound));
                    } else if (!writeAllowed(target.kind, role, actor,
                                             actorTenant, *row)) {
                        fcb(filterError("You may not change this item",
                                        drogon::k403Forbidden));
                    } else {
                        fccb();
                    }
                });
}

} // namespace pyracms
