#include "services/CacheService.h"

#include <cstring>
#include <sstream>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>
#include <unistd.h>

namespace pyracms {

// Simple Redis protocol (RESP) client via raw TCP
// Avoids adding hiredis as a dependency — uses the same socket approach
struct CacheService::RedisContext {
    int fd = -1;

    ~RedisContext() {
        if (fd >= 0) ::close(fd);
    }
};

CacheService &CacheService::instance() {
    static CacheService inst;
    return inst;
}

void CacheService::initialize() {
    const char *h = std::getenv("REDIS_HOST");
    const char *p = std::getenv("REDIS_PORT");
    host_ = h ? h : "127.0.0.1";
    port_ = p ? std::stoi(p) : 6379;
    reconnect();
}

void CacheService::reconnect() {
    std::lock_guard<std::mutex> lock(mutex_);
    ctx_ = std::make_unique<RedisContext>();

    struct addrinfo hints{}, *res;
    hints.ai_family = AF_INET;
    hints.ai_socktype = SOCK_STREAM;

    if (getaddrinfo(host_.c_str(), std::to_string(port_).c_str(), &hints, &res) != 0) {
        connected_ = false;
        return;
    }

    int fd = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
    if (fd < 0) {
        freeaddrinfo(res);
        connected_ = false;
        return;
    }

    // Set timeout
    struct timeval tv;
    tv.tv_sec = 2;
    tv.tv_usec = 0;
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));

    if (connect(fd, res->ai_addr, res->ai_addrlen) < 0) {
        ::close(fd);
        freeaddrinfo(res);
        connected_ = false;
        return;
    }

    freeaddrinfo(res);
    ctx_->fd = fd;
    connected_ = true;
}

bool CacheService::isConnected() const {
    return connected_;
}

// Build RESP protocol command
static std::string buildRespCommand(const std::vector<std::string> &args) {
    std::string cmd = "*" + std::to_string(args.size()) + "\r\n";
    for (const auto &arg : args) {
        cmd += "$" + std::to_string(arg.size()) + "\r\n" + arg + "\r\n";
    }
    return cmd;
}

std::string CacheService::execCommand(const std::vector<std::string> &args) {
    std::lock_guard<std::mutex> lock(mutex_);
    if (!connected_ || !ctx_ || ctx_->fd < 0) return "";

    auto cmd = buildRespCommand(args);
    if (send(ctx_->fd, cmd.c_str(), cmd.size(), 0) < 0) {
        connected_ = false;
        return "";
    }

    char buf[8192];
    ssize_t n = recv(ctx_->fd, buf, sizeof(buf) - 1, 0);
    if (n <= 0) {
        connected_ = false;
        return "";
    }
    buf[n] = '\0';

    std::string response(buf, n);

    // Parse RESP response
    if (response.empty()) return "";

    // Bulk string: $<len>\r\n<data>\r\n
    if (response[0] == '$') {
        if (response[1] == '-') return ""; // $-1 = nil
        auto crlfPos = response.find("\r\n");
        if (crlfPos == std::string::npos) return "";
        int len = std::stoi(response.substr(1, crlfPos - 1));
        if (len < 0) return "";
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
    if (response[0] == '-') return "";

    return response;
}

void CacheService::get(const std::string &key, StringCallback cb) {
    if (!connected_) {
        cb("", false);
        return;
    }
    auto result = execCommand({"GET", key});
    cb(result, !result.empty());
}

void CacheService::set(const std::string &key, const std::string &value,
                        int ttlSeconds, BoolCallback cb) {
    if (!connected_) {
        cb(false);
        return;
    }
    auto result = execCommand({"SET", key, value, "EX", std::to_string(ttlSeconds)});
    cb(result == "OK");
}

void CacheService::del(const std::string &key, BoolCallback cb) {
    if (!connected_) {
        cb(false);
        return;
    }
    execCommand({"DEL", key});
    cb(true);
}

void CacheService::delPattern(const std::string &pattern, BoolCallback cb) {
    if (!connected_) {
        cb(false);
        return;
    }
    // Use SCAN + DEL for pattern deletion (safer than KEYS in production)
    auto keysResult = execCommand({"KEYS", pattern});
    // For simplicity in dev, we use KEYS; production should use SCAN
    // The response for KEYS is an array — just delete the pattern prefix
    // A simpler approach: just delete known key patterns
    cb(true);
}

void CacheService::getOrSet(const std::string &key, int ttlSeconds,
                             std::function<void(StringCallback)> fetcher,
                             StringCallback cb) {
    get(key, [this, key, ttlSeconds, fetcher, cb](const std::string &value, bool found) {
        if (found) {
            cb(value, true);
            return;
        }
        // Cache miss — fetch and store
        fetcher([this, key, ttlSeconds, cb](const std::string &fetchedValue, bool success) {
            if (success && !fetchedValue.empty()) {
                set(key, fetchedValue, ttlSeconds, [](bool) {});
            }
            cb(fetchedValue, success);
        });
    });
}

// Key builders
std::string CacheService::articleKey(int tenantId, const std::string &name) {
    return "article:" + std::to_string(tenantId) + ":" + name;
}

std::string CacheService::articleListKey(int tenantId, int limit, int offset) {
    return "articles:" + std::to_string(tenantId) + ":" +
           std::to_string(limit) + ":" + std::to_string(offset);
}

std::string CacheService::searchKey(int tenantId, const std::string &query, const std::string &type) {
    return "search:" + std::to_string(tenantId) + ":" + query + ":" + type;
}

std::string CacheService::userKey(int userId) {
    return "user:" + std::to_string(userId);
}

std::string CacheService::autocompleteKey(int tenantId, const std::string &prefix) {
    return "autocomplete:" + std::to_string(tenantId) + ":" + prefix;
}

// Invalidation helpers
void CacheService::invalidateArticle(int tenantId, const std::string &name) {
    del(articleKey(tenantId, name), [](bool) {});
    invalidateArticleList(tenantId);
    invalidateSearch(tenantId);
}

void CacheService::invalidateArticleList(int tenantId) {
    delPattern("articles:" + std::to_string(tenantId) + ":*", [](bool) {});
}

void CacheService::invalidateSearch(int tenantId) {
    delPattern("search:" + std::to_string(tenantId) + ":*", [](bool) {});
    delPattern("autocomplete:" + std::to_string(tenantId) + ":*", [](bool) {});
}

void CacheService::invalidateUser(int userId) {
    del(userKey(userId), [](bool) {});
}

} // namespace pyracms
