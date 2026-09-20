#pragma once

#include "http_accounts.h"

// The creator becomes the site owner (an administrator too); drop that
// so the site's own administrators are the only ones counted.
inline harness::Site adminOnlySite() {
    auto s = harness::makeSite();
    testDb()->execSqlSync("UPDATE tenants SET owner_id=NULL WHERE id=$1",
                          s.id);
    return s;
}

inline std::string userPath(const harness::Acct &a, const char *sfx = "") {
    return "/api/users/" + std::to_string(a.id) + sfx;
}
