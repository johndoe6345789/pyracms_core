#pragma once

#include <string>
#include <string_view>

namespace pyracms {

// A sha256 that survives between requests: the hasher's state as hex, so
// each part of a chunked upload extends the hash of the parts before it
// and the whole object is never re-read or held in memory.
std::string shaStateInit();
std::string shaStateUpdate(const std::string &stateHex,
                           std::string_view data); // "" on a bad state
std::string shaStateFinal(const std::string &stateHex); // digest hex

std::string md5Hex(std::string_view data);

} // namespace pyracms
