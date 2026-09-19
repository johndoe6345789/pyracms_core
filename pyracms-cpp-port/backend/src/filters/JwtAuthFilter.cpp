#include "filters/JwtAuthFilter.h"

#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"

#include <drogon/drogon.h>

namespace pyracms {

AuthVerdict authVerdict(const TokenPayload &token, const UserState &state) {
    if (state.tenantId != token.tenantId)
        return {401, "Invalid or expired token"};
    if (token.issuedAt < state.validAfter)
        return {401, "Session ended, please sign in again"};
    if (state.banned)
        return {403, "Account is banned"};
    return {};
}

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

void JwtAuthFilter::doFilter(const drogon::HttpRequestPtr &req,
                             drogon::FilterCallback &&fcb,
                             drogon::FilterChainCallback &&fccb) {
    auto header = req->getHeader("Authorization");
    if (header.substr(0, 7) != "Bearer ") {
        fcb(filterError("Missing or invalid Authorization header",
                        drogon::k401Unauthorized));
        return;
    }
    auto payload = authService_.verifyToken(header.substr(7));
    if (!payload) {
        fcb(filterError("Invalid or expired token", drogon::k401Unauthorized));
        return;
    }
    // A signature alone is not enough: the account must still exist, not
    // be banned, and the token must not predate a password change.
    stateLookup()(payload->userId, [=, fcb = std::move(fcb),
                                    fccb = std::move(fccb)](
                                       bool ok, std::optional<UserState> st) {
        if (!ok) {
            fcb(filterError("Authentication unavailable",
                            drogon::k503ServiceUnavailable));
            return;
        }
        auto verdict = st ? authVerdict(*payload, *st)
                          : AuthVerdict{401, "Invalid or expired token"};
        if (verdict.status != 0) {
            fcb(filterError(verdict.message,
                            static_cast<drogon::HttpStatusCode>(
                                verdict.status)));
            return;
        }
        req->attributes()->insert("userId", payload->userId);
        req->attributes()->insert("username", payload->username);
        req->attributes()->insert("tenantId", payload->tenantId);
        req->attributes()->insert("role", st->role);

        // A tenant-scoped account may only act inside its own tenant.
        if (namesForeignTenant(payload->tenantId, namedTenants(req))) {
            fcb(filterError("This account belongs to a different site",
                            drogon::k403Forbidden));
            return;
        }
        fccb();
    });
}

} // namespace pyracms
