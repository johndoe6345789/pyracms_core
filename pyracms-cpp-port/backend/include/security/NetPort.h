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
inline void netSetTimeoutMs(int fd, int millis) {
    DWORD ms = static_cast<DWORD>(millis);
    auto s = static_cast<SOCKET>(fd);
    setsockopt(s, SOL_SOCKET, SO_RCVTIMEO,
               reinterpret_cast<const char *>(&ms), sizeof ms);
    setsockopt(s, SOL_SOCKET, SO_SNDTIMEO,
               reinterpret_cast<const char *>(&ms), sizeof ms);
}
inline void netSetTimeout(int fd, int seconds) {
    netSetTimeoutMs(fd, seconds * 1000);
}
#else
using SsizeT = ssize_t;

inline void netInit() {}
inline int netClose(int fd) { return ::close(fd); }

inline void netSetTimeoutMs(int fd, int millis) {
    struct timeval tv;
    tv.tv_sec = millis / 1000;
    tv.tv_usec = (millis % 1000) * 1000;
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));
}
inline void netSetTimeout(int fd, int seconds) {
    netSetTimeoutMs(fd, seconds * 1000);
}
#endif

} // namespace pyracms
