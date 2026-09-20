#include "services/CacheService.h"
#include "services/cache/CacheServiceInternal.h"

#include <cstring>
#include <sstream>

namespace pyracms {

std::string CacheService::execCommand(const std::vector<std::string> &args) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (!connected_ || !ctx_ || ctx_->fd < 0)
        return "";

    auto cmd = buildRespCommand(args);
    if (send(ctx_->fd, cmd.c_str(), cmd.size(), 0) < 0) {
        connected_ = false;
        return "";
    }

    char buf[8192];
    SsizeT n = recv(ctx_->fd, buf, sizeof(buf) - 1, 0);
    if (n <= 0) {
        connected_ = false;
        return "";
    }
    buf[n] = '\0';

    std::string response(buf, n);

    // Parse RESP response
    if (response.empty())
        return "";

    // Bulk string: $<len>\r\n<data>\r\n
    if (response[0] == '$') {
        if (response[1] == '-')
            return ""; // $-1 = nil
        auto crlfPos = response.find("\r\n");
        if (crlfPos == std::string::npos)
            return "";
        int len = std::stoi(response.substr(1, crlfPos - 1));
        if (len < 0)
            return "";
        return response.substr(crlfPos + 2, len);
    }
    // Simple string: +OK\r\n
    if (response[0] == '+') {
        auto crlfPos = response.find("\r\n");
        return response.substr(1, crlfPos - 1);
    }
    // Integer: :1\r\n
    if (response[0] == ':') {
        auto crlfPos = response.find("\r\n");
        return response.substr(1, crlfPos - 1);
    }
    // Error: -ERR ...\r\n
    if (response[0] == '-')
        return "";

    return response;
}

} // namespace pyracms
