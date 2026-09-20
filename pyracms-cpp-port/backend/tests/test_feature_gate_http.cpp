#include "http_accounts.h"

using namespace harness;

namespace {
void setFeature(const Site &s, const char *id, const char *value) {
    auto r = put(std::string("/api/settings/feature_") + id,
                 J({{"tenantId", s.id}, {"value", value}}), s.admin.token);
    ASSERT_EQ(r.status, 200);
}
} // namespace

TEST(FeatureGateHttp, DisabledFeaturesAreClosedPerSite) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto other = makeSite();
    auto t = "?tenant_id=" + std::to_string(s.id);
    // Never configured: everything works.
    EXPECT_EQ(get("/api/articles" + t).status, 200);
    struct Case {
        const char *id;
        const char *path;
    };
    for (auto c : {Case{"articles", "/api/articles"},
                   Case{"forum", "/api/forum/categories"},
                   Case{"gallery", "/api/gallery/albums"},
                   Case{"code_snippets", "/api/snippets"},
                   Case{"hypernucleus", "/api/gamedep/game"}}) {
        setFeature(s, c.id, "false");
        auto r = get(std::string(c.path) + t);
        EXPECT_EQ(r.status, 404) << c.path;
        EXPECT_EQ(r.json["feature"].asString(), c.id);
        EXPECT_FALSE(r.json["error"].asString().empty());
        // Another site is unaffected.
        auto ot = "?tenant_id=" + std::to_string(other.id);
        EXPECT_NE(get(std::string(c.path) + ot).status, 404) << c.path;
        // Turning it back on reopens the routes at once.
        setFeature(s, c.id, "true");
        EXPECT_NE(get(std::string(c.path) + t).status, 404) << c.path;
    }
}

TEST(FeatureGateHttp, DeletingTheSettingReenablesTheFeature) {
    REQUIRE_SERVER();
    auto s = makeSite();
    auto t = "?tenant_id=" + std::to_string(s.id);
    setFeature(s, "gallery", "false");
    EXPECT_EQ(get("/api/gallery/albums" + t).status, 404);
    EXPECT_EQ(del("/api/settings/feature_gallery", s.admin.token,
                  J({{"tenantId", s.id}}))
                  .status,
              200);
    EXPECT_EQ(get("/api/gallery/albums" + t).status, 200);
    // Settings stay reachable while a feature is off.
    setFeature(s, "gallery", "false");
    EXPECT_EQ(get("/api/settings?tenant_id=" + std::to_string(s.id)).status,
              200);
}
