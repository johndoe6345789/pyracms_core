#pragma once

#include "services/UserRole.h"

namespace pyracms {

// Clamp a raw DB value into the UserRole range (bad data -> User).
inline UserRole roleFromRaw(int raw) {
    if (raw < 0 || raw > 4)
        return UserRole::User;
    return static_cast<UserRole>(raw);
}

// True when the raw stored role meets `minimum`.
inline bool roleAllows(int raw, UserRole minimum) {
    return hasMinRole(roleFromRaw(raw), minimum);
}

} // namespace pyracms
