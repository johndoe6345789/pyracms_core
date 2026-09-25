#pragma once

#include <optional>
#include <string>

namespace pyracms {

constexpr size_t kMaxFolderDepth = 5;
constexpr size_t kMaxFolderLength = 512;

// "a/b" for a usable folder path ("" = the top level), std::nullopt when it
// is not one: segments are trimmed, may not be empty, "." or "..", contain
// control characters or backslashes, and there are at most kMaxFolderDepth.
std::optional<std::string> normalizeFolder(const std::string &raw);

} // namespace pyracms
