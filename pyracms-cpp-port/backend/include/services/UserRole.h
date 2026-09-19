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

// Display names for the five user levels (Guest, Normal User, Moderator,
// Administrator, Platform Owner). The enum keeps its historical
// identifiers; SiteAdmin is "Administrator", SuperAdmin "Platform Owner".
inline const char *roleName(UserRole r) {
    switch (r) {
    case UserRole::Guest: return "Guest";
    case UserRole::User: return "Normal User";
    case UserRole::Moderator: return "Moderator";
    case UserRole::SiteAdmin: return "Administrator";
    case UserRole::SuperAdmin: return "Platform Owner";
    }
    return "Guest";
}

// Returns true when `actual` meets or exceeds `minimum`.
inline bool hasMinRole(UserRole actual, UserRole minimum) {
    return static_cast<int>(actual) >= static_cast<int>(minimum);
}

} // namespace pyracms
