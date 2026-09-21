#include "filters/RateLimitFilter.h"

#include "filters/TenantGuard.h"
#include "security/ClientIp.h"
#include "security/RateLimiter.h"

namespace pyracms {

static bool endsWith(const std::string &s, const std::string &suffix) {
    return s.size() >= suffix.size() &&
           s.compare(s.size() - suffix.size(), suffix.size(), suffix) == 0;
}

RateRule rateRuleFor(const std::string &path) {
    if (path == "/api/auth/login")
        return {"login", 10, 60};
    if (path == "/api/auth/register")
        return {"register", 10, 600};
    if (path == "/api/auth/forgot-password")
        return {"forgot", 5, 600};
    if (path == "/api/auth/reset-password" ||
        path == "/api/auth/verify-email")
        return {"reset", 10, 600};
    if (path.rfind("/api/auth/oauth/", 0) == 0)
        return {"oauth", 20, 600};
    if (path == "/api/analytics/track")
        return {"track", 120, 60};
    if (path == "/api/files" || path == "/api/files/uploads")
        return {"upload", 30, 600};
    // Parts of a chunked upload: ~21 per GB, so its own generous bucket.
    if (path.rfind("/api/files/uploads/", 0) == 0)
        return {"uploadpart", 600, 600};
    // Anonymous game downloads: generous for a launcher fetching a
    // catalog's screenshots and resuming, hostile to scraping loops.
    if (path.rfind("/api/files/", 0) == 0)
        return {"download", 300, 60};
    if (path == "/api/tenants")
        return {"tenant", 10, 3600};
    if (path.rfind("/api/snippets/", 0) == 0 && endsWith(path, "/run"))
        return {"run", 10, 60};
    return {};
}

void RateLimitFilter::doFilter(const drogon::HttpRequestPtr &req,
                               drogon::FilterCallback &&fcb,
                               drogon::FilterChainCallback &&fccb) {
    auto rule = rateRuleFor(req->path());
    if (rule.name.empty() || !RateLimiter::enabled()) {
        fccb();
        return;
    }
    int retry = 0;
    auto key = rule.name + "|" + clientIp(req);
    if (RateLimiter::instance().allow(key, rule.max, rule.windowSec,
                                      &retry)) {
        fccb();
        return;
    }
    auto resp = filterError("Too many requests, slow down",
                            drogon::k429TooManyRequests);
    resp->addHeader("Retry-After", std::to_string(retry));
    fcb(resp);
}

} // namespace pyracms
