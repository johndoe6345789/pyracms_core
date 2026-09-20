#include "security/ClientIp.h"

#include "security/NetPort.h"

#include <cstring>

namespace pyracms {

bool isPrivateAddress(const std::string &ip) {
    in_addr a4;
    if (inet_pton(AF_INET, ip.c_str(), &a4) == 1) {
        unsigned b0 = ntohl(a4.s_addr) >> 24;
        unsigned b1 = (ntohl(a4.s_addr) >> 16) & 255;
        return b0 == 10 || b0 == 127 || b0 == 0 ||
               (b0 == 172 && b1 >= 16 && b1 <= 31) ||
               (b0 == 192 && b1 == 168) || (b0 == 169 && b1 == 254) ||
               (b0 == 100 && b1 >= 64 && b1 <= 127);
    }
    in6_addr a6;
    if (inet_pton(AF_INET6, ip.c_str(), &a6) != 1)
        return false;
    static const unsigned char lo[16] = {0, 0, 0, 0, 0, 0, 0, 0,
                                         0, 0, 0, 0, 0, 0, 0, 1};
    if (std::memcmp(&a6, lo, 16) == 0)
        return true;
    if ((a6.s6_addr[0] & 0xfe) == 0xfc) // fc00::/7
        return true;
    if (a6.s6_addr[0] == 0xfe && (a6.s6_addr[1] & 0xc0) == 0x80)
        return true; // fe80::/10
    // ::ffff:a.b.c.d maps an IPv4 address
    static const unsigned char mp[12] = {0, 0, 0, 0, 0, 0, 0, 0,
                                         0, 0, 255, 255};
    if (std::memcmp(&a6, mp, 12) == 0) {
        char buf[INET_ADDRSTRLEN];
        return inet_ntop(AF_INET, a6.s6_addr + 12, buf, sizeof buf) &&
               isPrivateAddress(buf);
    }
    return false;
}

std::string pickClientIp(const std::string &peer,
                         const std::string &forwardedFor) {
    if (forwardedFor.empty() || !isPrivateAddress(peer))
        return peer;
    auto comma = forwardedFor.rfind(',');
    auto last = comma == std::string::npos ? forwardedFor
                                           : forwardedFor.substr(comma + 1);
    auto b = last.find_first_not_of(" \t");
    auto e = last.find_last_not_of(" \t");
    if (b == std::string::npos)
        return peer;
    last = last.substr(b, e - b + 1);
    in_addr a4;
    in6_addr a6;
    bool valid = inet_pton(AF_INET, last.c_str(), &a4) == 1 ||
                 inet_pton(AF_INET6, last.c_str(), &a6) == 1;
    return valid ? last : peer;
}

std::string clientIp(const drogon::HttpRequestPtr &req) {
    return pickClientIp(req->getPeerAddr().toIp(),
                        req->getHeader("X-Forwarded-For"));
}

} // namespace pyracms
