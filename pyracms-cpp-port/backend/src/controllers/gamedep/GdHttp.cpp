#include "controllers/gamedep/GdHttp.h"

#include "filters/TenantGuard.h"
#include "filters/TenantRules.h"
#include "filters/Viewer.h"

namespace pyracms {

static std::string namedTenant(const drogon::HttpRequestPtr &req) {
    for (const auto &v : namedTenants(req)) {
        if (!v.empty())
            return v;
    }
    return "";
}

// PUBLIC_BASE_URL (deployment config) wins: Host headers are client input
// and must not decide where catalog download links point.
std::string gdBaseUrl(const drogon::HttpRequestPtr &req) {
    if (const char *fixed = std::getenv("PUBLIC_BASE_URL")) {
        if (*fixed)
            return fixed;
    }
    std::string host = req->getHeader("x-forwarded-host");
    if (host.empty())
        host = req->getHeader("host");
    if (host.empty())
        return "";
    std::string proto = req->getHeader("x-forwarded-proto");
    return (proto.empty() ? "http" : proto) + "://" + host;
}

GdCtx gdReadCtx(const drogon::HttpRequestPtr &req) {
    GdCtx c;
    c.db = drogon::app().getDbClient();
    Viewer v = viewerOf(req);
    c.userId = v.userId;
    c.scope = effectiveScope(v.tenantId, namedTenant(req));
    c.base = gdBaseUrl(req);
    return c;
}

GdCtx gdWriteCtx(const drogon::HttpRequestPtr &req) {
    GdCtx c;
    c.db = drogon::app().getDbClient();
    c.userId = req->attributes()->get<int>("userId");
    c.scope = effectiveScope(tokenTenantOf(req), namedTenant(req));
    c.base = gdBaseUrl(req);
    return c;
}

GdCb gdReply(HttpCb callback) {
    return [callback](const GdResult &r) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(r.body);
        resp->setStatusCode(static_cast<drogon::HttpStatusCode>(r.status));
        callback(resp);
    };
}

Json::Value gdBody(const drogon::HttpRequestPtr &req) {
    auto j = req->getJsonObject();
    return j ? *j : Json::Value(Json::objectValue);
}

int gdInt(const std::string &text, int fallback) {
    try {
        return text.empty() ? fallback : std::stoi(text);
    } catch (...) {
        return fallback;
    }
}

} // namespace pyracms
