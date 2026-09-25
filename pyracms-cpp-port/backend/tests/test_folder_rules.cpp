#include "services/FolderRules.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(FolderRules, NormalisesPaths) {
    EXPECT_EQ(normalizeFolder(""), std::string());
    EXPECT_EQ(normalizeFolder("   "), std::string());
    EXPECT_EQ(normalizeFolder(" photos / 2024 "), "photos/2024");
    EXPECT_EQ(normalizeFolder("a"), "a");
}

TEST(FolderRules, RejectsBadPaths) {
    for (const char *bad : {"/a", "a/", "a//b", "..", "a/../b", ".", "a\\b",
                            "a\nb", "a/b/c/d/e/f"})
        EXPECT_FALSE(normalizeFolder(bad)) << bad;
    EXPECT_FALSE(normalizeFolder(std::string(600, 'x') + "/y"));
    EXPECT_TRUE(normalizeFolder("a/b/c/d/e"));
}
