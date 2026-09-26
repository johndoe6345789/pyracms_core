#include "controllers/FileVisibility.h"

#include <gtest/gtest.h>

using namespace pyracms;

TEST(FileVisibilityRules, KnowsTheTwoKinds) {
    EXPECT_TRUE(isFileVisibility("public"));
    EXPECT_TRUE(isFileVisibility("authenticated"));
    EXPECT_FALSE(isFileVisibility(""));
    EXPECT_FALSE(isFileVisibility("Public"));
    EXPECT_FALSE(isFileVisibility("private"));
}

TEST(FileVisibilityRules, AuthenticatedNeedsAViewer) {
    EXPECT_TRUE(fileVisibleTo("public", 0));
    EXPECT_TRUE(fileVisibleTo("public", 5));
    EXPECT_FALSE(fileVisibleTo("authenticated", 0));
    EXPECT_TRUE(fileVisibleTo("authenticated", 5));
}

#include "security/FileLink.h"

TEST(FileLinkRules, SignedLinksExpireAndBindToTheFile) {
    const std::string a = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const std::string b = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    auto sig = fileLinkSig(a, 2000);
    EXPECT_TRUE(fileLinkValid(a, "2000", sig, 1999));
    EXPECT_FALSE(fileLinkValid(a, "2000", sig, 2000));   // expired
    EXPECT_FALSE(fileLinkValid(b, "2000", sig, 1000));   // another file
    EXPECT_FALSE(fileLinkValid(a, "2001", sig, 1000));   // moved expiry
    EXPECT_FALSE(fileLinkValid(a, "2000", "", 1000));
    EXPECT_FALSE(fileLinkValid(a, "", sig, 1000));
    EXPECT_FALSE(fileLinkValid(a, "20x0", sig, 1000));
    EXPECT_FALSE(fileLinkValid(a, "2000", sig + "0", 1000));
}
