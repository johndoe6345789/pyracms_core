#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>

namespace pyracms {

class SeoService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using StringCallback = std::function<void(const std::string &)>;

    void generateSitemap(const DbClientPtr &db, int tenantId,
                         const std::string &baseUrl,
                         StringCallback cb);

    void generateRssFeed(const DbClientPtr &db, int tenantId,
                         const std::string &baseUrl,
                         const std::string &siteTitle,
                         StringCallback cb);

    void generateAtomFeed(const DbClientPtr &db, int tenantId,
                          const std::string &baseUrl,
                          const std::string &siteTitle,
                          StringCallback cb);

    void getArticleJsonLd(const DbClientPtr &db, int tenantId,
                          const std::string &articleName,
                          const std::string &baseUrl,
                          std::function<void(const Json::Value &)> cb);

    void getOpenGraphData(const DbClientPtr &db, int tenantId,
                          const std::string &articleName,
                          const std::string &baseUrl,
                          std::function<void(const Json::Value &)> cb);

private:
    std::string xmlEscape(const std::string &s);
};

} // namespace pyracms
