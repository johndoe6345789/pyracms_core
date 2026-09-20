#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace pyracms {

// True when the site explicitly switched `name` off (stored "false").
// Missing settings and database errors count as "on": a site that never
// touched the setting keeps the default behaviour.
inline void whenSwitchedOff(const drogon::orm::DbClientPtr &db, int tenantId,
                            const std::string &name,
                            std::function<void(bool)> cb) {
    db->execSqlAsync(
        "SELECT value FROM settings WHERE tenant_id = $1 AND name = $2",
        [cb](const drogon::orm::Result &r) {
            cb(!r.empty() && !r[0]["value"].isNull() &&
               r[0]["value"].as<std::string>() == "false");
        },
        [cb](const drogon::orm::DrogonDbException &) { cb(false); }, tenantId,
        name);
}

} // namespace pyracms
