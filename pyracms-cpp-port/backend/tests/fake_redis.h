#pragma once

#include <arpa/inet.h>
#include <atomic>
#include <netinet/in.h>
#include <string>
#include <sys/socket.h>
#include <thread>
#include <unistd.h>

namespace fake {
// A tiny RESP server: PING, a 40 KB GET, a SCAN; "BYE" answers, hangs up.
struct FakeRedis {
    int lfd = ::socket(AF_INET, SOCK_STREAM, 0);
    int port = 0;
    std::atomic<bool> stop{false};
    std::thread th;
    FakeRedis() {
        sockaddr_in a{};
        a.sin_family = AF_INET;
        a.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
        ::bind(lfd, reinterpret_cast<sockaddr *>(&a), sizeof a);
        socklen_t n = sizeof a;
        getsockname(lfd, reinterpret_cast<sockaddr *>(&a), &n);
        port = ntohs(a.sin_port);
        ::listen(lfd, 8);
        th = std::thread([this] {
            while (!stop) {
                int fd = ::accept(lfd, nullptr, nullptr);
                if (fd < 0)
                    break;
                char buf[256];
                while (ssize_t got = ::recv(fd, buf, sizeof buf, 0)) {
                    if (got <= 0)
                        break;
                    std::string in(buf, static_cast<size_t>(got)), out;
                    if (in.find("BYE") != std::string::npos) {
                        ::send(fd, "+OK\r\n", 5, 0);
                        break; // ...and hang up
                    }
                    if (in.find("GET") != std::string::npos)
                        out = "$40000\r\n" + std::string(40000, 'x') + "\r\n";
                    else if (in.find("SCAN") != std::string::npos)
                        out = "*2\r\n$1\r\n0\r\n*2\r\n$1\r\na\r\n$1\r\nb\r\n";
                    else
                        out = "+PONG\r\n";
                    ::send(fd, out.data(), out.size(), 0);
                }
                ::close(fd);
            }
        });
    }
    ~FakeRedis() {
        stop = true;
        ::shutdown(lfd, SHUT_RDWR);
        ::close(lfd);
        th.join();
    }
};

} // namespace fake
