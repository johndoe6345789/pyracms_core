#include "filters/FeatureGate.h"

#include <gtest/gtest.h>

using namespace pyracms;
namespace {
struct Restore {
    FeatureLookup saved{featureLookup()};
    ~Restore() { featureLookup() = saved; }
};

struct Outcome {
    bool passed{false};
    int status{0};
    std::string feature;
    std::string asked;
};

Outcome run(const std::string &path, bool on, bool stub = true) {
    Restore restore;
    Outcome o;
    if (stub) {
        featureLookup() = [&o, on](int t, const std::string &f, auto cb) {
            o.asked = std::to_string(t) + ":" + f;
            cb(on);
        };
    }
    auto req = drogon::HttpRequest::newHttpRequest();
    req->setPath(path.substr(0, path.find('?')));
    if (path.find('?') != std::string::npos)
        req->setParameter("tenant_id", path.substr(path.find('=') + 1));
    featureGate(
        req,
        [&](const drogon::HttpResponsePtr &r) {
            o.status = static_cast<int>(r->statusCode());
            o.feature = (*r->jsonObject())["feature"].asString();
        },
        [&]() { o.passed = true; });
    return o;
}
} // namespace

TEST(FeatureGateTest, DisabledFeatureIs404WithFeatureName) {
    auto o = run("/api/forum/threads?tenant_id=7", false);
    EXPECT_FALSE(o.passed);
    EXPECT_EQ(o.status, 404);
    EXPECT_EQ(o.feature, "forum");
    EXPECT_EQ(o.asked, "7:forum");
}

TEST(FeatureGateTest, EnabledFeaturePasses) {
    EXPECT_TRUE(run("/api/articles?tenant_id=7", true).passed);
}

TEST(FeatureGateTest, UngatedPathOrNoTenantSkipsLookup) {
    auto a = run("/api/settings/x?tenant_id=7", false);
    EXPECT_TRUE(a.passed);
    EXPECT_TRUE(a.asked.empty());
    auto b = run("/api/articles", false);
    EXPECT_TRUE(b.passed);
    EXPECT_TRUE(b.asked.empty());
}

TEST(FeatureGateTest, NonObjectJsonBodyDoesNotThrow) {
    Restore restore;
    bool asked = false;
    featureLookup() = [&](int, const std::string &, auto cb) {
        asked = true;
        cb(true);
    };
    auto req = drogon::HttpRequest::newHttpJsonRequest(Json::Value("x"));
    req->setPath("/api/articles");
    bool passed = false;
    featureGate(req, [](const drogon::HttpResponsePtr &) {},
                [&]() { passed = true; });
    EXPECT_TRUE(passed);
    EXPECT_FALSE(asked);
}
