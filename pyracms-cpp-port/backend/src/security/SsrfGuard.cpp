#include "security/SsrfGuard.h"

#include <arpa/inet.h>
#include <cstdlib>
#include <cstring>
#include <netdb.h>
#include <sys/socket.h>

namespace pyracms {

static bool blockedV4(unsigned a, unsigned b, unsigned c) {
    return a == 0 || a == 10 || a == 127 || a >= 224 ||
           (a == 100 && b >= 64 && b <= 127) || (a == 169 && b == 254) ||
           (a == 172 && b >= 16 && b <= 31) || (a == 192 && b == 168) ||
           (a == 192 && b == 0 && c == 0) || (a == 198 && (b == 18 || b == 19));
}

bool isBlockedIp(const std::string &ip) {
    in_addr v4;
    if (inet_pton(AF_INET, ip.c_str(), &v4) == 1) {
        auto n = ntohl(v4.s_addr);
        return blockedV4(n >> 24, (n >> 16) & 255, (n >> 8) & 255);
    }
    in6_addr v6;
    if (inet_pton(AF_INET6, ip.c_str(), &v6) != 1)
        return true; // not an address at all: refuse
    const unsigned char *b = v6.s6_addr;
    bool zeros10 = true;
    for (int i = 0; i < 10; ++i)
        zeros10 = zeros10 && b[i] == 0;
    if (zeros10 && b[10] == 0xff && b[11] == 0xff) // ::ffff:a.b.c.d
        return blockedV4(b[12], b[13], b[14]);
    bool zeros12 = zeros10 && b[10] == 0 && b[11] == 0;
    if (zeros12) // ::, ::1 and IPv4-compatible
        return true;
    if (b[0] == 0x00 && b[1] == 0x64 && b[2] == 0xff && b[3] == 0x9b)
        return blockedV4(b[12], b[13], b[14]); // NAT64
    if (b[0] == 0x20 && b[1] == 0x02) // 6to4 embeds a v4 address
        return blockedV4(b[2], b[3], b[4]);
    return (b[0] & 0xfe) == 0xfc || b[0] == 0xff ||
           (b[0] == 0xfe && (b[1] & 0xc0) == 0x80);
}

std::string checkOutboundUrl(const std::string &url) {
    auto p = parseHttpUrl(url);
    if (!p.ok)
        return "URL must be http(s) without credentials";
    const char *allow = std::getenv("PYRACMS_ALLOW_PRIVATE_URLS");
    if (allow && std::strcmp(allow, "1") == 0)
        return "";
    addrinfo hints{};
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    addrinfo *res = nullptr;
    if (getaddrinfo(p.host.c_str(), nullptr, &hints, &res) != 0 || !res)
        return "Host does not resolve";
    std::string reason;
    for (auto *a = res; a; a = a->ai_next) {
        char buf[INET6_ADDRSTRLEN] = {0};
        const void *src = a->ai_family == AF_INET
            ? static_cast<const void *>(
                  &reinterpret_cast<sockaddr_in *>(a->ai_addr)->sin_addr)
            : static_cast<const void *>(
                  &reinterpret_cast<sockaddr_in6 *>(a->ai_addr)->sin6_addr);
        if (!inet_ntop(a->ai_family, src, buf, sizeof buf) ||
            isBlockedIp(buf)) {
            reason = "URL points to a private or reserved address";
            break;
        }
    }
    freeaddrinfo(res);
    return reason;
}

} // namespace pyracms
