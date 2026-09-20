#pragma once

#include "services/UserRole.h"

#include <drogon/drogon.h>
#include <functional>
#include <optional>
#include <string>

namespace pyracms {

struct UserDto {
    int id;
    std::string username;
    std::string fullName;
    std::string email;
    std::string website;
    std::string aboutme;
    std::string timezone;
    bool banned;
    std::string createdAt;
    std::string apiUuid;
    // Role stored as the integer value of UserRole; defaults to User (1)
    UserRole role{UserRole::User};
    // 0 = platform account, otherwise the tenant the account belongs to
    int tenantId{0};
    // Filled by the scoped listing only (admin UI guards).
    bool siteOwner{false};
    bool lastAdmin{false};
};

} // namespace pyracms
