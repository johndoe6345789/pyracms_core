#include "security/SsrfGuard.h"

namespace pyracms {

ParsedUrl parseHttpUrl(const std::string &url) {
    ParsedUrl p;
    if (url.size() > 2048)
        return p;
    for (unsigned char c : url) {
        if (c <= ' ' || c == 0x7f)
            return p;
    }
    auto sep = url.find("://");
    if (sep == std::string::npos)
        return p;
    auto scheme = url.substr(0, sep);
    if (scheme != "http" && scheme != "https")
        return p;
    auto rest = url.substr(sep + 3);
    auto slash = rest.find_first_of("/?#");
    auto authority = rest.substr(0, slash);
    if (authority.empty() || authority.find('@') != std::string::npos ||
        authority.find('\\') != std::string::npos)
        return p;
    std::string host = authority;
    if (authority.front() == '[') { // [v6]:port
        auto close = authority.find(']');
        if (close == std::string::npos)
            return p;
        host = authority.substr(1, close - 1);
        if (close + 1 < authority.size() && authority[close + 1] != ':')
            return p;
    } else {
        auto colon = authority.find(':');
        if (colon != std::string::npos)
            host = authority.substr(0, colon);
    }
    if (host.empty())
        return p;
    p.ok = true;
    p.scheme = scheme;
    p.host = host;
    p.origin = scheme + "://" + authority;
    auto tail = slash == std::string::npos ? "" : rest.substr(slash);
    auto hash = tail.find('#');
    if (hash != std::string::npos)
        tail = tail.substr(0, hash);
    p.path = tail.empty() ? "/" : (tail[0] == '/' ? tail : "/" + tail);
    return p;
}

} // namespace pyracms
