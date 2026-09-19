#include "controllers/WsAuth.h"

#include <cctype>

namespace pyracms {

std::optional<TokenPayload> wsAuthenticate(const drogon::HttpRequestPtr &req) {
    std::string token = req->getParameter("token");
    auto header = req->getHeader("Authorization");
    if (token.empty() && header.rfind("Bearer ", 0) == 0)
        token = header.substr(7);
    if (token.empty())
        return std::nullopt;
    AuthService auth;
    return auth.verifyToken(token);
}

std::string sanitizeRoom(const std::string &raw) {
    if (raw.empty() || raw.size() > 64)
        return "";
    for (unsigned char c : raw) {
        if (!std::isalnum(c) && c != '_' && c != '.' && c != ':' && c != '-')
            return "";
    }
    return raw;
}

} // namespace pyracms
