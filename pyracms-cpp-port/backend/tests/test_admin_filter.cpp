#include "controllers/BoolReply.h"
#include "filters/AdminFilter.h"
#include "filters/Viewer.h"
#include "services/AuthService.h"

#include <gtest/gtest.h>

using namespace pyracms;

namespace {
struct Outcome {
    bool passed{false};
    int status{0};
};

Outcome run(std::optional<int> role, bool authed = true) {
    AdminFilter::roleLookup() =
        [role](int, std::function<void(std::optional<int>)> cb) { cb(role); };
    auto req = drogon::HttpRequest::newHttpRequest();
    if (authed)
        req->attributes()->insert("userId", 1);
    Outcome o;
    AdminFilter f;
    f.doFilter(
        req,
        [&](const drogon::HttpResponsePtr &r) {
            o.status = static_cast<int>(r->statusCode());
        },
        [&]() { o.passed = true; });
    return o;
}
} // namespace

TEST(AdminFilterTest, AnonymousIs401) {
    EXPECT_EQ(run(4, false).status, 401);
}

TEST(AdminFilterTest, PlainUserIs403) {
    EXPECT_EQ(run(1).status, 403);
    EXPECT_EQ(run(2).status, 403);
}

TEST(AdminFilterTest, SiteAdminAndSuperAdminPass) {
    EXPECT_TRUE(run(3).passed);
    EXPECT_TRUE(run(4).passed);
}

TEST(AdminFilterTest, LookupFailureIs500) {
    EXPECT_EQ(run(std::nullopt).status, 500);
}

TEST(ViewerTest, AnonymousAndBadTokenAreZero) {
    auto req = drogon::HttpRequest::newHttpRequest();
    EXPECT_EQ(viewerOf(req).userId, 0);
    req->addHeader("Authorization", "Bearer junk");
    EXPECT_EQ(viewerOf(req).userId, 0);
}

TEST(ViewerTest, ValidTokenGivesIdentity) {
    AuthService a;
    auto req = drogon::HttpRequest::newHttpRequest();
    req->addHeader("Authorization", "Bearer " + a.generateToken(8, "x", 5));
    auto v = viewerOf(req);
    EXPECT_EQ(v.userId, 8);
    EXPECT_EQ(v.tenantId, 5);
}

TEST(BoolReplyTest, MapsOutcomesToStatusCodes) {
    int status = 0;
    auto reply = boolReply([&](const drogon::HttpResponsePtr &r) {
        status = static_cast<int>(r->statusCode());
    });
    reply(true, "");
    EXPECT_EQ(status, 200);
    reply(false, "Not found");
    EXPECT_EQ(status, 404);
    reply(false, "other");
    EXPECT_EQ(status, 400);
}
