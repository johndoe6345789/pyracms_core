#pragma once

#include "http_harness.h"

namespace harness {

struct Acct {
    int id{0};
    int tenant{0};
    std::string token;
    std::string name;
};

// Registers a fresh account over HTTP (tenant slug "" = platform) and
// sets its role directly (1 user, 2 moderator, 3 site admin, 4 super).
Acct signup(const std::string &tenantSlug, int role = 1);
// A fresh tenant created through the API by a platform super admin.
int newTenant(const Acct &platformAdmin, std::string &slugOut);
Acct platformAdmin();

struct Site {
    int id{0};
    std::string slug;
    Acct admin; // site admin
    Acct user;  // plain member
};
Site makeSite();

} // namespace harness
