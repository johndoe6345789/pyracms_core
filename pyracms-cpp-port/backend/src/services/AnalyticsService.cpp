#include "services/AnalyticsService.h"

namespace pyracms {

void AnalyticsService::trackPageView(
    const DbClientPtr &db, int tenantId,
    const std::string &path, const std::string &referrer,
    const std::string &userAgent, const std::string &ipHash,
    BoolCallback cb) {

    db->execSqlAsync(
        "INSERT INTO page_views (tenant_id, path, referrer, user_agent, ip_hash) "
        "VALUES ($1, $2, $3, $4, $5)",
        [cb](const drogon::orm::Result &) {
            cb(true, "");
        },
        [cb](const drogon::orm::DrogonDbException &e) {
            cb(false, e.base().what());
        },
        tenantId, path, referrer, userAgent, ipHash);
}

void AnalyticsService::getPageViews(
    const DbClientPtr &db, int tenantId,
    const std::string &period,
    std::function<void(const std::vector<PageViewStat> &)> cb) {

    std::string interval = "30 days";
    std::string truncate = "day";

    if (period == "week") {
        interval = "12 weeks";
        truncate = "week";
    } else if (period == "month") {
        interval = "12 months";
        truncate = "month";
    } else {
        // default: day, last 30 days
        interval = "30 days";
        truncate = "day";
    }

    std::string sql =
        "SELECT date_trunc('" + truncate + "', created_at) AS date, "
        "COUNT(*) AS count "
        "FROM page_views "
        "WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '" + interval + "' "
        "GROUP BY date "
        "ORDER BY date ASC";

    db->execSqlAsync(
        sql,
        [cb](const drogon::orm::Result &result) {
            std::vector<PageViewStat> stats;
            for (const auto &row : result) {
                PageViewStat stat;
                stat.date = row["date"].as<std::string>();
                stat.count = row["count"].as<int>();
                stats.push_back(stat);
            }
            cb(stats);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId);
}

void AnalyticsService::getTopContent(
    const DbClientPtr &db, int tenantId, int limit,
    std::function<void(const std::vector<TopContentItem> &)> cb) {

    db->execSqlAsync(
        "SELECT path, COUNT(*) AS views "
        "FROM page_views "
        "WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '30 days' "
        "GROUP BY path "
        "ORDER BY views DESC "
        "LIMIT $2",
        [cb](const drogon::orm::Result &result) {
            std::vector<TopContentItem> items;
            for (const auto &row : result) {
                TopContentItem item;
                item.path = row["path"].as<std::string>();
                item.title = item.path;  // Could be enriched with actual titles
                item.views = row["views"].as<int>();
                items.push_back(item);
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId, limit);
}

void AnalyticsService::getTrafficSources(
    const DbClientPtr &db, int tenantId, int limit,
    std::function<void(const std::vector<TrafficSource> &)> cb) {

    db->execSqlAsync(
        "SELECT COALESCE(NULLIF(referrer, ''), 'direct') AS referrer, "
        "COUNT(*) AS count "
        "FROM page_views "
        "WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '30 days' "
        "GROUP BY referrer "
        "ORDER BY count DESC "
        "LIMIT $2",
        [cb](const drogon::orm::Result &result) {
            std::vector<TrafficSource> sources;
            for (const auto &row : result) {
                TrafficSource source;
                source.referrer = row["referrer"].as<std::string>();
                source.count = row["count"].as<int>();
                sources.push_back(source);
            }
            cb(sources);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId, limit);
}

void AnalyticsService::getSearchQueries(
    const DbClientPtr &db, int tenantId, int limit,
    std::function<void(const std::vector<SearchQueryStat> &)> cb) {

    db->execSqlAsync(
        "SELECT query, COUNT(*) AS count, "
        "AVG(result_count) AS avg_results "
        "FROM search_queries "
        "WHERE tenant_id = $1 "
        "AND created_at >= NOW() - INTERVAL '30 days' "
        "GROUP BY query "
        "ORDER BY count DESC "
        "LIMIT $2",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchQueryStat> stats;
            for (const auto &row : result) {
                SearchQueryStat stat;
                stat.query = row["query"].as<std::string>();
                stat.count = row["count"].as<int>();
                stat.avgResults = row["avg_results"].as<double>();
                stats.push_back(stat);
            }
            cb(stats);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId, limit);
}

void AnalyticsService::recordSearchQuery(
    const DbClientPtr &db, int tenantId,
    const std::string &query, int resultCount, int userId,
    BoolCallback cb) {

    if (userId > 0) {
        db->execSqlAsync(
            "INSERT INTO search_queries (tenant_id, query, result_count, user_id) "
            "VALUES ($1, $2, $3, $4)",
            [cb](const drogon::orm::Result &) {
                cb(true, "");
            },
            [cb](const drogon::orm::DrogonDbException &e) {
                cb(false, e.base().what());
            },
            tenantId, query, resultCount, userId);
    } else {
        db->execSqlAsync(
            "INSERT INTO search_queries (tenant_id, query, result_count) "
            "VALUES ($1, $2, $3)",
            [cb](const drogon::orm::Result &) {
                cb(true, "");
            },
            [cb](const drogon::orm::DrogonDbException &e) {
                cb(false, e.base().what());
            },
            tenantId, query, resultCount);
    }
}

} // namespace pyracms
