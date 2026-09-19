#include "filters/JwtAuthFilter.h"

#include <drogon/drogon.h>

namespace pyracms {

JwtAuthFilter::StateLookup &JwtAuthFilter::stateLookup() {
    static StateLookup lookup = [](int userId, StateCb cb) {
        drogon::app().getDbClient()->execSqlAsync(
            "SELECT role, banned, COALESCE(tenant_id, 0) AS tenant_id, "
            "COALESCE(FLOOR(EXTRACT(EPOCH FROM token_valid_after)), 0)"
            "::bigint AS valid_after FROM users WHERE id = $1",
            [cb](const drogon::orm::Result &r) {
                if (r.empty())
                    return cb(true, std::nullopt);
                UserState s;
                s.role = r[0]["role"].as<int>();
                s.banned = r[0]["banned"].as<bool>();
                s.tenantId = r[0]["tenant_id"].as<int>();
                s.validAfter = r[0]["valid_after"].as<long long>();
                cb(true, s);
            },
            [cb](const drogon::orm::DrogonDbException &) {
                cb(false, std::nullopt);
            },
            userId);
    };
    return lookup;
}

} // namespace pyracms
