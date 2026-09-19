#pragma once

#include "filters/JwtAuthFilter.h"

#include <string>

// Unit tests run JwtAuthFilter without a database: the account state
// lookup is replaced by one that agrees with whatever the token claims.
inline void stubAccountState(const std::string &header) {
    int tenant = 0;
    if (header.rfind("Bearer ", 0) == 0) {
        pyracms::AuthService a;
        if (auto p = a.verifyToken(header.substr(7)))
            tenant = p->tenantId;
    }
    pyracms::JwtAuthFilter::stateLookup() =
        [tenant](int, pyracms::JwtAuthFilter::StateCb cb) {
            pyracms::UserState s;
            s.tenantId = tenant;
            cb(true, s);
        };
}
