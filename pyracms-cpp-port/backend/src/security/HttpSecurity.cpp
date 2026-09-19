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

static void addCors(const drogon::HttpRequestPtr &req,
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

static drogon::HttpResponsePtr jsonError(drogon::HttpStatusCode code,
                                         const std::string &msg) {
    Json::Value body;
    body["error"] = msg;
    auto resp = drogon::HttpResponse::newHttpJsonResponse(body);
    resp->setStatusCode(code);
    return resp;
}

void installHttpSecurity(drogon::HttpAppFramework &app) {
    if (const char *mb = std::getenv("MAX_UPLOAD_MB")) {
        int v = std::atoi(mb);
        if (v > 0 && v <= 512)
            app.setClientMaxBodySize(static_cast<size_t>(v) << 20);
    } else {
        app.setClientMaxBodySize(25u << 20);
    }
    app.setIdleConnectionTimeout(60);
    app.setMaxConnectionNumPerIP(200);

    app.registerSyncAdvice(
        [](const drogon::HttpRequestPtr &req) -> drogon::HttpResponsePtr {
            if (req->method() == drogon::Options) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k204NoContent);
                addCors(req, resp);
                resp->addHeader("Access-Control-Max-Age", "86400");
                return resp;
            }
            bool multipart =
                req->contentType() == drogon::CT_MULTIPART_FORM_DATA;
            if (!multipart && req->body().size() > kMaxJsonBody)
                return jsonError(drogon::k413RequestEntityTooLarge,
                                 "Request body too large");
            return {};
        });
    app.registerPostHandlingAdvice(
        [](const drogon::HttpRequestPtr &req,
           const drogon::HttpResponsePtr &resp) {
            addCors(req, resp);
            addSecurityHeaders(req, resp);
        });
    // Never hand exception text (or a stack) to a client.
    app.setExceptionHandler(
        [](const std::exception &e, const drogon::HttpRequestPtr &,
           std::function<void(const drogon::HttpResponsePtr &)> &&cb) {
            bool badInput = dynamic_cast<const std::invalid_argument *>(&e) ||
                            dynamic_cast<const std::out_of_range *>(&e) ||
                            dynamic_cast<const Json::LogicError *>(&e);
            LOG_WARN << "unhandled exception: " << e.what();
            cb(badInput ? jsonError(drogon::k400BadRequest,
                                    "Invalid request parameter")
                        : jsonError(drogon::k500InternalServerError,
                                    "Internal server error"));
        });
}

} // namespace pyracms
