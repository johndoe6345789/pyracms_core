#pragma once

#include <string>

namespace pyracms {

// A short-lived signed link for one file. Browsers cannot send a Bearer
// header from <img>, <a href> or a download, so a signed-in user asks for
// `exp` + `sig` and appends them to the file's URL. The signature covers
// the file uuid and the expiry (HMAC-SHA256 under the server secret).
constexpr int kFileLinkSeconds = 900;

std::string fileLinkSig(const std::string &uuid, long long exp);

// True when `exp` is still in the future and `sig` matches.
bool fileLinkValid(const std::string &uuid, const std::string &exp,
                   const std::string &sig, long long now);

} // namespace pyracms
