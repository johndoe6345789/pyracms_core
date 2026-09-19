#pragma once

#include <drogon/HttpFilter.h>
#include <string>

namespace pyracms {

struct RateRule {
    std::string name; // bucket name; "" = not limited
    int max{0};
    int windowSec{0};
};

// Limit for a request path (pure; unit-tested).
RateRule rateRuleFor(const std::string &path);

// Per client-IP + route bucket. Chain first on abuse-prone routes.
class RateLimitFilter : public drogon::HttpFilter<RateLimitFilter> {
  public:
    void doFilter(const drogon::HttpRequestPtr &req,
                  drogon::FilterCallback &&fcb,
                  drogon::FilterChainCallback &&fccb) override;
};

} // namespace pyracms
