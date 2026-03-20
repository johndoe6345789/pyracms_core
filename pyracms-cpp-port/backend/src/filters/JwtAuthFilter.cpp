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

    // Continue to the next filter/handler
    fccb();
}

} // namespace pyracms
