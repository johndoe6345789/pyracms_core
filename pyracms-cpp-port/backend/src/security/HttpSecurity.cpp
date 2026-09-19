#include "security/HttpSecurity.h"

#include <sstream>

namespace pyracms {

std::string corsOriginFor(const std::string &allowedCsv,
                          const std::string &origin) {
    if (allowedCsv.empty())
        return "*";
    std::stringstream ss(allowedCsv);
    std::string item;
    while (std::getline(ss, item, ',')) {
        auto b = item.find_first_not_of(" ");
        auto e = item.find_last_not_of(" ");
        if (b == std::string::npos)
            continue;
        item = item.substr(b, e - b + 1);
        if (item == "*")
            return "*";
        if (!origin.empty() && item == origin)
            return origin;
    }
    return "";
}

static std::string allowedOrigins() {
    const char *v = std::getenv("CORS_ALLOWED_ORIGINS");
    return v ? v : "";
}

void addCors(const drogon::HttpRequestPtr &req,
                    const drogon::HttpResponsePtr &resp) {
    auto allow = corsOriginFor(allowedOrigins(), req->getHeader("Origin"));
    if (allow.empty())
        return;
    resp->addHeader("Access-Control-Allow-Origin", allow);
    if (allow != "*")
        resp->addHeader("Vary", "Origin");
    resp->addHeader("Access-Control-Allow-Methods",
                    "GET, POST, PUT, DELETE, OPTIONS");
    resp->addHeader("Access-Control-Allow-Headers",
                    "Content-Type, Authorization");
}

void addSecurityHeaders(const drogon::HttpRequestPtr &req,
                        const drogon::HttpResponsePtr &resp) {
    resp->addHeader("X-Content-Type-Options", "nosniff");
    resp->addHeader("X-Frame-Options", "DENY");
    resp->addHeader("Referrer-Policy", "no-referrer");
    const auto &path = req->path();
    if (path != "/api/docs")
        resp->addHeader("Content-Security-Policy",
                        "default-src 'none'; frame-ancestors 'none'; "
                        "sandbox");
    if (path.rfind("/api/files", 0) != 0)
        resp->addHeader("Cache-Control", "no-store");
    if (req->getHeader("X-Forwarded-Proto") == "https")
        resp->addHeader("Strict-Transport-Security",
                        "max-age=31536000; includeSubDomains");
}

} // namespace pyracms
