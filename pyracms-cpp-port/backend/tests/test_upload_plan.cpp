#include "services/upload/UploadHash.h"
#include "services/upload/UploadPlan.h"
#include "controllers/UploadLimits.h"
#include "filters/RateLimitFilter.h"

#include <gtest/gtest.h>
#include <openssl/sha.h>

using namespace pyracms;

TEST(UploadHash, StateSurvivesBetweenParts) {
    std::string a(1000, 'x'), b(70, 'y'), c = "z";
    auto s = shaStateUpdate(shaStateUpdate(shaStateUpdate(shaStateInit(), a),
                                           b), c);
    unsigned char d[SHA256_DIGEST_LENGTH];
    auto all = a + b + c;
    SHA256(reinterpret_cast<const unsigned char *>(all.data()), all.size(),
           d);
    std::string want;
    for (unsigned char x : d) {
        want += "0123456789abcdef"[x >> 4];
        want += "0123456789abcdef"[x & 15];
    }
    EXPECT_EQ(shaStateFinal(s), want);
    EXPECT_EQ(shaStateUpdate("bad", a), "");
    EXPECT_EQ(shaStateFinal(""), "");
    EXPECT_EQ(md5Hex("abc"), "900150983cd24fb0d6963f7d28e17f72");
}

TEST(UploadPlan, OrderRetryAndLimits) {
    auto init = shaStateInit();
    std::vector<PartRow> parts{{1, 5, "m1", "s1"}, {2, 5, "m2", "s2"}};
    EXPECT_EQ(planPart(parts, 3, 5, "m3", 20).action, PartAction::Store);
    EXPECT_EQ(planPart(parts, 3, 5, "m3", 20).prevState, "s2");
    EXPECT_EQ(planPart(parts, 4, 5, "m", 20).action, PartAction::OutOfOrder);
    EXPECT_EQ(planPart(parts, 0, 5, "m", 20).action, PartAction::OutOfOrder);
    auto dup = planPart(parts, 1, 5, "m1", 20);
    EXPECT_EQ(dup.action, PartAction::Duplicate);
    EXPECT_EQ(dup.etag, "m1");
    EXPECT_EQ(planPart(parts, 1, 5, "new", 20).action,
              PartAction::OutOfOrder);
    auto redo = planPart(parts, 2, 6, "new", 20);
    EXPECT_EQ(redo.action, PartAction::Store);
    EXPECT_EQ(redo.prevState, "s1");
    EXPECT_EQ(planPart({}, 1, 4, "m", 20).prevState, init);
    EXPECT_EQ(planPart(parts, 3, 11, "m3", 20).action, PartAction::TooMuch);
}

TEST(UploadPlan, PartPathsOnlyMatchTheRoute) {
    EXPECT_TRUE(isPartPath("/api/files/uploads/abc/parts/2"));
    EXPECT_FALSE(isPartPath("/api/files/uploads/abc/complete"));
    EXPECT_FALSE(isPartPath("/api/files/uploads/parts/2"));
    EXPECT_FALSE(isPartPath("/api/files/uploads/a/parts/2/x"));
}

TEST(UploadPlan, PartsHaveTheirOwnRateBucket) {
    EXPECT_EQ(rateRuleFor("/api/files/uploads").name, "upload");
    EXPECT_EQ(rateRuleFor("/api/files/uploads/x/parts/1").name, "uploadpart");
    EXPECT_EQ(rateRuleFor("/api/files/abc").name, "download");
}
