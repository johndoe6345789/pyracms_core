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

struct AnalyticsSummary {
    int views7{0};
    int views30{0};
    std::vector<TopContentItem> topPages; // last 30 days, at most 10
};

class AnalyticsService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;
    using BoolCallback =
        std::function<void(bool success, const std::string &error)>;

    void getSummary(const DbClientPtr &db, int tenantId,
                    std::function<void(bool ok, const AnalyticsSummary &)> cb);

    void trackPageView(const DbClientPtr &db, int tenantId,
                       const std::string &path, const std::string &referrer,
                       const std::string &userAgent, const std::string &ipHash,
                       BoolCallback cb);

    void
    getPageViews(const DbClientPtr &db, int tenantId, const std::string &period,
                 std::function<void(const std::vector<PageViewStat> &)> cb);

    void
    getTopContent(const DbClientPtr &db, int tenantId, int limit,
                  std::function<void(const std::vector<TopContentItem> &)> cb);

    void getTrafficSources(
        const DbClientPtr &db, int tenantId, int limit,
        std::function<void(const std::vector<TrafficSource> &)> cb);

    // Counts one search for the popular-queries table. Anonymous on purpose
    // (no user id); the text is trimmed and lower-cased so 'React' and
    // 'react ' count together. Fire and forget: analytics never delays a
    // search. Blank or one-character queries are ignored.
    static void recordSearch(const DbClientPtr &db, int tenantId,
                             const std::string &query, int resultCount);
    void getSearchQueries(
        const DbClientPtr &db, int tenantId, int limit,
        std::function<void(const std::vector<SearchQueryStat> &)> cb);
};

} // namespace pyracms
