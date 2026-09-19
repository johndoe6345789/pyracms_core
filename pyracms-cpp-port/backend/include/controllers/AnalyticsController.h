#pragma once

#include "services/AnalyticsService.h"

#include <drogon/HttpController.h>

namespace pyracms {

class AnalyticsController : public drogon::HttpController<AnalyticsController> {
  public:
    METHOD_LIST_BEGIN
    ADD_METHOD_TO(AnalyticsController::getPageViews,
                  "/api/analytics/page-views", drogon::Get,
                  "pyracms::JwtAuthFilter", "pyracms::AdminFilter");
    ADD_METHOD_TO(AnalyticsController::getTopContent,
                  "/api/analytics/top-content", drogon::Get,
                  "pyracms::JwtAuthFilter", "pyracms::AdminFilter");
    ADD_METHOD_TO(AnalyticsController::getTrafficSources,
                  "/api/analytics/traffic-sources", drogon::Get,
                  "pyracms::JwtAuthFilter", "pyracms::AdminFilter");
    ADD_METHOD_TO(AnalyticsController::getSearchQueries,
                  "/api/analytics/search-queries", drogon::Get,
                  "pyracms::JwtAuthFilter", "pyracms::AdminFilter");
    ADD_METHOD_TO(AnalyticsController::trackPageView, "/api/analytics/track",
                  drogon::Post, "pyracms::RateLimitFilter");
    METHOD_LIST_END

    void getPageViews(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getTopContent(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getTrafficSources(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void getSearchQueries(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

    void trackPageView(
        const drogon::HttpRequestPtr &req,
        std::function<void(const drogon::HttpResponsePtr &)> &&callback);

  private:
    AnalyticsService analyticsService_;
};

} // namespace pyracms
