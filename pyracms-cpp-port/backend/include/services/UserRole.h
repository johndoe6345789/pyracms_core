#pragma once

namespace pyracms {

// Role hierarchy — numeric values intentionally ordered so that higher
// numbers imply greater privilege, enabling simple integer comparison.
enum class UserRole : int {
    Guest      = 0,
    User       = 1,
    Moderator  = 2,
    SiteAdmin  = 3,
    SuperAdmin = 4,
};

// Returns true when `actual` meets or exceeds `minimum`.
inline bool hasMinRole(UserRole actual, UserRole minimum) {
    return static_cast<int>(actual) >= static_cast<int>(minimum);
}

// Migration helper: legacy isAdmin flag maps to SiteAdmin.
inline UserRole roleFromLegacyAdminFlag(bool isAdmin) {
    return isAdmin ? UserRole::SiteAdmin : UserRole::User;
}

} // namespace pyracms
