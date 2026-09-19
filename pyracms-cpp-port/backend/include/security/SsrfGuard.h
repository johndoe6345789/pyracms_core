#pragma once

#include <string>

namespace pyracms {

// Server-side request forgery defence for URLs users supply (webhooks).

struct ParsedUrl {
    bool ok{false};
    std::string scheme; // "http" | "https"
    std::string host;
    std::string origin; // scheme://host[:port]
    std::string path;   // begins with '/', includes any query
};

// http(s) only, no credentials, no control characters or spaces.
ParsedUrl parseHttpUrl(const std::string &url);

// Loopback, private, link-local (cloud metadata), CGNAT, multicast,
// unspecified, reserved and their IPv6 / IPv4-mapped forms.
bool isBlockedIp(const std::string &ip);

// "" when `url` may be fetched, else the reason. Resolves the host and
// rejects it if ANY address is blocked. PYRACMS_ALLOW_PRIVATE_URLS=1 lifts
// the address check (dev / tests only).
std::string checkOutboundUrl(const std::string &url);

} // namespace pyracms
