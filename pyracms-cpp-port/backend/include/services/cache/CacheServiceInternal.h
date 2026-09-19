#pragma once

#include "services/CacheService.h"

#include <arpa/inet.h>
#include <cstring>
#include <netdb.h>
#include <netinet/in.h>
#include <sstream>
#include <sys/socket.h>
#include <unistd.h>

namespace pyracms {

// Simple Redis protocol (RESP) client via raw TCP
// Avoids adding hiredis as a dependency — uses the same socket approach
struct CacheService::RedisContext {
    int fd = -1;

    ~RedisContext() {
        if (fd >= 0)
            ::close(fd);
    }
};

// Build RESP protocol command
inline std::string buildRespCommand(const std::vector<std::string> &args) {
    std::string cmd = "*" + std::to_string(args.size()) + "\r\n";
    for (const auto &arg : args) {
        cmd += "$" + std::to_string(arg.size()) + "\r\n" + arg + "\r\n";
    }
    return cmd;
}

} // namespace pyracms
