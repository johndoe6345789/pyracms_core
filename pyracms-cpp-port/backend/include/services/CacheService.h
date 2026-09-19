#pragma once

#include <functional>
#include <memory>
#include <mutex>
#include <string>
#include <vector>

namespace pyracms {

class CacheService {
  public:
    using StringCallback =
        std::function<void(const std::string &value, bool found)>;
    using BoolCallback = std::function<void(bool success)>;

    static CacheService &instance();

    void initialize();
    bool isConnected() const;

    void get(const std::string &key, StringCallback cb);
    void set(const std::string &key, const std::string &value, int ttlSeconds,
             BoolCallback cb);
    void del(const std::string &key, BoolCallback cb);
    void delPattern(const std::string &pattern, BoolCallback cb);

    // Key builders
    static std::string articleKey(int tenantId, const std::string &name);
    static std::string searchKey(int tenantId, const std::string &query,
                                 const std::string &type);
    static std::string autocompleteKey(int tenantId, const std::string &prefix);

    // Invalidation helpers
    void invalidateArticle(int tenantId, const std::string &name);
    void invalidateArticleList(int tenantId);
    void invalidateSearch(int tenantId);

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
