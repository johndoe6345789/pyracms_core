#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <string>
#include <vector>

namespace pyracms {

struct PageViewStat {
    std::string date;
    int count;
};

struct TopContentItem {
    std::string path;
    std::string title;
    int views;
};

struct TrafficSource {
    std::string referrer;
    int count;
};

struct SearchQueryStat {
    std::string query;
    int count;
    double avgResults;
};

class AnalyticsService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback = std::function<void(bool success, const std::string &error)>;

    void trackPageView(const DbClientPtr &db, int tenantId,
                       const std::string &path, const std::string &referrer,
                       const std::string &userAgent, const std::string &ipHash,
                       BoolCallback cb);

    void getPageViews(const DbClientPtr &db, int tenantId,
                      const std::string &period,
                      std::function<void(const std::vector<PageViewStat> &)> cb);

    void getTopContent(const DbClientPtr &db, int tenantId, int limit,
                       std::function<void(const std::vector<TopContentItem> &)> cb);

    void getTrafficSources(const DbClientPtr &db, int tenantId, int limit,
                           std::function<void(const std::vector<TrafficSource> &)> cb);

    void getSearchQueries(const DbClientPtr &db, int tenantId, int limit,
                          std::function<void(const std::vector<SearchQueryStat> &)> cb);

    void recordSearchQuery(const DbClientPtr &db, int tenantId,
                           const std::string &query, int resultCount, int userId,
                           BoolCallback cb);
};

} // namespace pyracms
