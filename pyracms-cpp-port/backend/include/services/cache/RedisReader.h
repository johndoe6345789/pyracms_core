#pragma once

#include "security/NetPort.h"

#include <string>

namespace pyracms {

// Buffered reads of a RESP reply from a socket.
struct RespReader {
    int fd;
    std::string buf;
    size_t at = 0;
    bool fill() {
        char tmp[16384];
        SsizeT n = recv(fd, tmp, sizeof tmp, 0);
        if (n <= 0)
            return false;
        buf.append(tmp, static_cast<size_t>(n));
        return true;
    }
    bool line(std::string &out) {
        size_t end;
        while ((end = buf.find("\r\n", at)) == std::string::npos)
            if (!fill())
                return false;
        out = buf.substr(at, end - at);
        at = end + 2;
        return true;
    }
    bool bytes(size_t n, std::string &out) {
        while (buf.size() - at < n + 2)
            if (!fill())
                return false;
        out = buf.substr(at, n);
        at += n + 2;
        return true;
    }
};

} // namespace pyracms
