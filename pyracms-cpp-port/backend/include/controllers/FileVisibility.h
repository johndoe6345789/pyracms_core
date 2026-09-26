#pragma once

#include <string>

namespace pyracms {

// The two ways a file can be shared.
inline bool isFileVisibility(const std::string &v) {
    return v == "public" || v == "authenticated";
}

// May this viewer fetch the file? `viewerId` is 0 for anonymous callers
// and for tokens from another site (see viewerIdFor).
inline bool fileVisibleTo(const std::string &visibility, int viewerId) {
    return visibility != "authenticated" || viewerId > 0;
}

} // namespace pyracms
