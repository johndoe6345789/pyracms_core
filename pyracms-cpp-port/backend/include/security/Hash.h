#pragma once

#include <string>

namespace pyracms {

// Lower-case hex SHA-256 of `data`. Used to store secrets (reset tokens)
// so a database leak does not hand out usable tokens.
std::string sha256Hex(const std::string &data);

} // namespace pyracms
