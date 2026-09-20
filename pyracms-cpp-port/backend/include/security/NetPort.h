#pragma once

// Sockets on POSIX and Windows behind one header, so the Redis client and
// the SSRF / client-IP code build on both. Linux behaviour is unchanged.

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#else
#include <arpa/inet.h>
#include <netdb.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <unistd.h>
#endif

namespace pyracms {

#ifdef _WIN32
using SsizeT = int;

// Winsock must be started once per process.
inline void netInit() {
    static const bool started = [] {
        WSADATA data;
        return WSAStartup(MAKEWORD(2, 2), &data) == 0;
    }();
    (void)started;
}

inline int netClose(int fd) { return closesocket(static_cast<SOCKET>(fd)); }

// Send/receive timeout; Winsock takes milliseconds, POSIX a timeval.
inline void netSetTimeout(int fd, int seconds) {
    DWORD ms = static_cast<DWORD>(seconds) * 1000;
    auto s = static_cast<SOCKET>(fd);
    setsockopt(s, SOL_SOCKET, SO_RCVTIMEO,
               reinterpret_cast<const char *>(&ms), sizeof ms);
    setsockopt(s, SOL_SOCKET, SO_SNDTIMEO,
               reinterpret_cast<const char *>(&ms), sizeof ms);
}
#else
using SsizeT = ssize_t;

inline void netInit() {}
inline int netClose(int fd) { return ::close(fd); }

inline void netSetTimeout(int fd, int seconds) {
    struct timeval tv;
    tv.tv_sec = seconds;
    tv.tv_usec = 0;
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));
}
#endif

} // namespace pyracms
