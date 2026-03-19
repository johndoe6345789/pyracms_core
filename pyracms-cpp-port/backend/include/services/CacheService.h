#pragma once

#include <functional>
#include <string>
#include <vector>
#include <mutex>
#include <memory>

namespace pyracms {

class CacheService {
public:
    using StringCallback = std::function<void(const std::string &value, bool found)>;
    using BoolCallback = std::function<void(bool success)>;

    static CacheService &instance();

    void initialize();
    bool isConnected() const;

    void get(const std::string &key, StringCallback cb);
    void set(const std::string &key, const std::string &value, int ttlSeconds, BoolCallback cb);
    void del(const std::string &key, BoolCallback cb);
    void delPattern(const std::string &pattern, BoolCallback cb);

    // Convenience: cache-aside pattern
    void getOrSet(const std::string &key, int ttlSeconds,
                  std::function<void(StringCallback)> fetcher,
                  StringCallback cb);

    // Key builders
    static std::string articleKey(int tenantId, const std::string &name);
    static std::string articleListKey(int tenantId, int limit, int offset);
    static std::string searchKey(int tenantId, const std::string &query, const std::string &type);
    static std::string userKey(int userId);
    static std::string autocompleteKey(int tenantId, const std::string &prefix);

    // Invalidation helpers
    void invalidateArticle(int tenantId, const std::string &name);
    void invalidateArticleList(int tenantId);
    void invalidateSearch(int tenantId);
    void invalidateUser(int userId);

private:
    CacheService() = default;

    struct RedisContext;
    std::unique_ptr<RedisContext> ctx_;
    std::mutex mutex_;
    bool connected_ = false;
    std::string host_;
    int port_ = 6379;

    void reconnect();
    std::string execCommand(const std::vector<std::string> &args);
};

} // namespace pyracms
