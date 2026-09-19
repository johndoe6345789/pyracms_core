#pragma once

#include "filters/RoleRules.h"
#include "filters/TenantRules.h"

#include <string>

namespace pyracms {

// Who may change a row that belongs to someone. Pure and unit-tested.
// tokenTenant 0 = platform account (may reach any site).

enum class Resource { None, Article, Album, Picture, Webhook, File };

// A resource located from the request path, e.g. /api/articles/{name}/x.
struct Target {
    Resource kind{Resource::None};
    std::string key; // article name, numeric id or file uuid
};

Target targetOf(const std::string &path);

struct OwnedRow {
    int ownerId{0};     // 0 = nobody
    int tenantId{0};
    bool siteOwner{false}; // actor owns the site this row lives in
};

// Articles, albums, pictures: the author, a moderator or a site owner.
// Webhooks: site administrators and site owners only.
// Files: the uploader or an administrator of that site.
inline bool writeAllowed(Resource kind, int role, int actorId,
                         int actorTenant, const OwnedRow &row) {
    if (!tenantMatches(actorTenant, row.tenantId))
        return false;
    switch (kind) {
    case Resource::Webhook:
        return roleAllows(role, UserRole::SiteAdmin) || row.siteOwner;
    case Resource::File:
        return (row.ownerId != 0 && row.ownerId == actorId) ||
               roleAllows(role, UserRole::SiteAdmin);
    default:
        return (row.ownerId != 0 && row.ownerId == actorId) ||
               roleAllows(role, UserRole::Moderator) || row.siteOwner;
    }
}

} // namespace pyracms
