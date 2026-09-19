#pragma once

#include "http_accounts.h"

// A platform-token user who owns a fresh site (stored role stays User).
struct OwnedSite {
    harness::Site site;
    harness::Acct owner;
};

inline OwnedSite ownedSite() {
    OwnedSite o;
    o.site = harness::makeSite();
    o.owner = harness::signup("", 1);
    testDb()->execSqlSync(
        "UPDATE tenants SET owner_id=$1 WHERE id=$2", o.owner.id,
        o.site.id);
    return o;
}

// Category (and a forum in it) made by the site admin; returns ids.
inline std::pair<int, int> seedBoard(const harness::Site &s) {
    using namespace harness;
    post("/api/forum/categories",
         J({{"name", "Cat"}, {"tenantId", s.id}}), s.admin.token);
    int cid = maxId("forum_categories");
    post("/api/forum/forums", J({{"categoryId", cid}, {"name", "F"}}),
         s.admin.token);
    return {cid, maxId("forums")};
}
