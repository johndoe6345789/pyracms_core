#include "filters/JwtAuthFilter.h"

namespace pyracms {

void JwtAuthFilter::doFilter(const drogon::HttpRequestPtr &req,
                              drogon::FilterCallback &&fcb,
                              drogon::FilterChainCallback &&fccb) {
    // Extract Bearer token from Authorization header
    auto authHeader = req->getHeader("Authorization");
    if (authHeader.empty() || authHeader.substr(0, 7) != "Bearer ") {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(
            Json::Value{});
        auto &body = *resp->jsonObject();
        body["error"] = "Missing or invalid Authorization header";
        resp->setStatusCode(drogon::k401Unauthorized);
        fcb(resp);
        return;
    }

    auto token = authHeader.substr(7);
    auto payload = authService_.verifyToken(token);
    if (!payload) {
        auto resp = drogon::HttpResponse::newHttpJsonResponse(
            Json::Value{});
        auto &body = *resp->jsonObject();
        body["error"] = "Invalid or expired token";
        resp->setStatusCode(drogon::k401Unauthorized);
        fcb(resp);
        return;
    }

    // Attach user info to request attributes for downstream handlers
    req->attributes()->insert("userId", payload->userId);
    req->attributes()->insert("username", payload->username);
    req->attributes()->insert("tenantId", payload->tenantId);

    // A tenant-scoped account may only act inside its own tenant. Reject
    // requests that name a different tenant explicitly.
    if (payload->tenantId != 0) {
        auto named = [&](const std::string &v) {
            return !v.empty() && v != std::to_string(payload->tenantId);
        };
        bool foreign = named(req->getParameter("tenant_id"))
                    || named(req->getParameter("tenantId"));
        if (auto body = req->getJsonObject()) {
            for (const char *k : {"tenant_id", "tenantId"}) {
                if (body->isMember(k) && (*body)[k].isConvertibleTo(
                        Json::stringValue) &&
                    named((*body)[k].asString())) {
                    foreign = true;
                }
            }
        }
        if (foreign) {
            auto resp = drogon::HttpResponse::newHttpJsonResponse(
                Json::Value{});
            (*resp->jsonObject())["error"] =
                "This account belongs to a different site";
            resp->setStatusCode(drogon::k403Forbidden);
            fcb(resp);
            return;
        }
    }

    // Continue to the next filter/handler
    fccb();
}

} // namespace pyracms
