#include "filters/JwtAuthFilter.h"
#include "filters/TenantGuard.h"

#include <gtest/gtest.h>

using namespace pyracms;

namespace {
struct Outcome {
    bool passed{false};
    int status{0};
};

Outcome run(const drogon::HttpRequestPtr &req) {
    Outcome o;
    JwtAuthFilter f;
    f.doFilter(
        req,
        [&](const drogon::HttpResponsePtr &r) {
            o.status = static_cast<int>(r->statusCode());
        },
        [&]() { o.passed = true; });
    return o;
}

drogon::HttpRequestPtr reqWith(const std::string &token,
                               const Json::Value &body = Json::nullValue) {
    auto req = body.isNull() ? drogon::HttpRequest::newHttpRequest()
                             : drogon::HttpRequest::newHttpJsonRequest(body);
    if (!token.empty())
        req->addHeader("Authorization", "Bearer " + token);
    return req;
}
} // namespace

TEST(JwtFilterTest, TenantTokenForeignBodyIs403) {
    AuthService a;
    Json::Value body;
    body["tenantId"] = 4;
    EXPECT_EQ(run(reqWith(a.generateToken(5, "r", 3), body)).status, 403);
    body["tenantId"] = 3;
    EXPECT_TRUE(run(reqWith(a.generateToken(5, "r", 3), body)).passed);
}

TEST(JwtFilterTest, TokenTenantOfDefaultsToZero) {
    EXPECT_EQ(tokenTenantOf(drogon::HttpRequest::newHttpRequest()), 0);
}
