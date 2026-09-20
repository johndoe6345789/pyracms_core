#include "filters/FeatureCache.h"
#include "filters/FeatureRules.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(FeatureRules, PathsMapToTheirFeature) {
    EXPECT_EQ(featureOfPath("/api/articles"), "articles");
    EXPECT_EQ(featureOfPath("/api/articles/x/revisions"), "articles");
    EXPECT_EQ(featureOfPath("/api/forum/threads/3"), "forum");
    EXPECT_EQ(featureOfPath("/api/gallery/albums"), "gallery");
    EXPECT_EQ(featureOfPath("/api/snippets/4/run"), "code_snippets");
    EXPECT_EQ(featureOfPath("/api/gamedep/game"), "hypernucleus");
    EXPECT_EQ(featureOfPath("/api/outputs/json"), "hypernucleus");
    EXPECT_EQ(featureOfPath("/api/operating-systems"), "hypernucleus");
    EXPECT_EQ(featureOfPath("/api/architectures"), "hypernucleus");
}

TEST(FeatureRules, OtherPathsAreNotGated) {
    EXPECT_EQ(featureOfPath("/api/settings/feature_forum"), "");
    EXPECT_EQ(featureOfPath("/api/articlesx"), "");
    EXPECT_EQ(featureOfPath("/api/auth/login"), "");
    EXPECT_EQ(featureOfPath("/"), "");
}

TEST(FeatureRules, EnabledUnlessExplicitlyFalse) {
    EXPECT_TRUE(featureEnabled(std::nullopt));
    EXPECT_TRUE(featureEnabled(std::string("true")));
    EXPECT_TRUE(featureEnabled(std::string("")));
    EXPECT_FALSE(featureEnabled(std::string("false")));
}

TEST(FeatureCacheTest, ExpiresAndClears) {
    FeatureCache c;
    auto t0 = FeatureCache::Clock::now();
    bool v = true;
    EXPECT_FALSE(c.get(1, "forum", v, t0));
    c.put(1, "forum", false, t0);
    ASSERT_TRUE(c.get(1, "forum", v, t0 + std::chrono::seconds(5)));
    EXPECT_FALSE(v);
    EXPECT_FALSE(c.get(2, "forum", v, t0));
    EXPECT_FALSE(c.get(1, "forum", v, t0 + FeatureCache::kTtl));
    c.put(1, "forum", true, t0);
    c.clear();
    EXPECT_FALSE(c.get(1, "forum", v, t0));
    EXPECT_EQ(&FeatureCache::instance(), &FeatureCache::instance());
}
