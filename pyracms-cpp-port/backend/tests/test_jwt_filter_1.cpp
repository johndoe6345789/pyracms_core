#include "filters/JwtAuthFilter.h"
#include "filters/TenantGuard.h"
#include "jwt_stub.h"

#include <gtest/gtest.h>

using namespace pyracms;

namespace {
struct Outcome {
    bool passed{false};
    int status{0};
};

Outcome run(const drogon::HttpRequestPtr &req) {
    Outcome o;
    StubAccountState stub(req->getHeader("Authorization"));
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

TEST(JwtFilterTest, MissingHeaderIs401) {
    EXPECT_EQ(run(reqWith("")).status, 401);
}

TEST(JwtFilterTest, GarbageTokenIs401) {
    EXPECT_EQ(run(reqWith("nope")).status, 401);
}

TEST(JwtFilterTest, PlatformTokenMayNameAnyTenant) {
    AuthService a;
    auto req = reqWith(a.generateToken(1, "root"));
    req->setParameter("tenant_id", "9");
    EXPECT_TRUE(run(req).passed);
}

TEST(JwtFilterTest, TenantTokenSetsAttributes) {
    AuthService a;
    auto req = reqWith(a.generateToken(5, "rich", 3));
    ASSERT_TRUE(run(req).passed);
    EXPECT_EQ(req->attributes()->get<int>("userId"), 5);
    EXPECT_EQ(tokenTenantOf(req), 3);
}

TEST(JwtFilterTest, TenantTokenForeignQueryIs403) {
    AuthService a;
    auto req = reqWith(a.generateToken(5, "rich", 3));
    req->setParameter("tenant_id", "4");
    EXPECT_EQ(run(req).status, 403);
}

TEST(JwtFilterTest, TenantTokenOwnQueryPasses) {
    AuthService a;
    auto req = reqWith(a.generateToken(5, "rich", 3));
    req->setParameter("tenantId", "3");
    EXPECT_TRUE(run(req).passed);
}
