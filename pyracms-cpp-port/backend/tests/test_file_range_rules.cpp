#include "controllers/FileEtag.h"
#include "controllers/FileRange.h"
#include "filters/RateLimitFilter.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(FileRange, ParsesSingleRanges) {
    auto a = parseRange("bytes=10-19", 100);
    EXPECT_EQ(a.kind, RangeKind::Partial);
    EXPECT_EQ(a.start, 10u);
    EXPECT_EQ(a.length, 10u);
    EXPECT_EQ(parseRange("bytes=90-", 100).length, 10u);
    EXPECT_EQ(parseRange("bytes=90-999", 100).length, 10u);
    auto s = parseRange("bytes=-5", 100);
    EXPECT_EQ(s.start, 95u);
    EXPECT_EQ(s.length, 5u);
    EXPECT_EQ(parseRange("bytes=-500", 100).length, 100u);
}

TEST(FileRange, IgnoresOrRejectsTheRest) {
    EXPECT_EQ(parseRange("", 9).kind, RangeKind::Whole);
    EXPECT_EQ(parseRange("junk", 9).kind, RangeKind::Whole);
    EXPECT_EQ(parseRange("bytes=1-2,4-5", 9).kind, RangeKind::Whole);
    EXPECT_EQ(parseRange("bytes=5-2", 9).kind, RangeKind::Whole);
    EXPECT_EQ(parseRange("bytes=a-2", 9).kind, RangeKind::Whole);
    EXPECT_EQ(parseRange("bytes=9-", 9).kind, RangeKind::Unsatisfiable);
    EXPECT_EQ(parseRange("bytes=-0", 9).kind, RangeKind::Unsatisfiable);
    EXPECT_EQ(parseRange("bytes=0-", 0).kind, RangeKind::Unsatisfiable);
    EXPECT_EQ(parseRange("bytes=99999999999999999999-", 9).kind,
              RangeKind::Whole);
}

TEST(FileRange, ResumesAreNotCountedAsDownloads) {
    EXPECT_TRUE(countsAsDownload(""));
    EXPECT_TRUE(countsAsDownload("bytes=0-"));
    EXPECT_FALSE(countsAsDownload("bytes=1024-"));
    EXPECT_FALSE(countsAsDownload("bytes=-10"));
}

TEST(FileEtag, StrongTagAndMatching) {
    EXPECT_EQ(fileEtag("abc", 1, 5, false), "\"abc\"");
    EXPECT_EQ(fileEtag("abc", 1, 5, true), "\"abc-t\"");
    EXPECT_EQ(fileEtag("", 7, 5, false), "\"7-5\"");
    EXPECT_TRUE(etagMatches("\"abc\"", "\"abc\""));
    EXPECT_TRUE(etagMatches("\"x\", W/\"abc\"", "\"abc\""));
    EXPECT_TRUE(etagMatches("*", "\"abc\""));
    EXPECT_FALSE(etagMatches("\"x\"", "\"abc\""));
    EXPECT_FALSE(etagMatches("", "\"abc\""));
}

TEST(RateLimitFilterTest, FileDownloadsAreRateLimited) {
    auto r = rateRuleFor("/api/files/some-uuid");
    EXPECT_EQ(r.name, "download");
    EXPECT_EQ(rateRuleFor("/api/files/some-uuid/thumbnail").name, "download");
    EXPECT_GE(r.max, 60);
}
