#pragma once

#include <drogon/HttpRequest.h>
#include <string>

namespace pyracms {

// True for loopback / RFC1918 / link-local / ULA addresses.
bool isPrivateAddress(const std::string &ip);

// Pure choice: the forwarded header is honoured only when the direct
// peer is a private-range reverse proxy, and then the LAST entry is used
// (the one the proxy appended; earlier entries are client-supplied).
std::string pickClientIp(const std::string &peer,
                         const std::string &forwardedFor);

std::string clientIp(const drogon::HttpRequestPtr &req);

} // namespace pyracms
