#include "services/TenantService.h"

#include <gtest/gtest.h>

// Unit tests for TenantService pure-logic methods.
// All tests here are DB-free: they exercise static helpers only.
// Integration tests that spin up a real Postgres instance are
// tracked separately (see TODO at end of file).

using namespace pyracms;

TEST(TenantServiceTest, NormalizeSlugSpaceBecomesHyphen) {
    EXPECT_EQ(TenantService::normalizeSlug("Hello World"), "hello-world");
}

TEST(TenantServiceTest, NormalizeSlugMultipleSpacesCollapsed) {
    EXPECT_EQ(TenantService::normalizeSlug("Hello   World"), "hello-world");
}

TEST(TenantServiceTest, NormalizeSlugSpecialCharBecomesHyphen) {
    EXPECT_EQ(TenantService::normalizeSlug("my_site!"), "my-site");
}

TEST(TenantServiceTest, NormalizeSlugStripsLeadingHyphen) {
    // Input starts with a non-alnum char that would produce a leading '-'
    EXPECT_EQ(TenantService::normalizeSlug(" leading"), "leading");
}

TEST(TenantServiceTest, NormalizeSlugStripsTrailingHyphen) {
    EXPECT_EQ(TenantService::normalizeSlug("trailing "), "trailing");
}

TEST(TenantServiceTest, NormalizeSlugAllUppercase) {
    EXPECT_EQ(TenantService::normalizeSlug("MY AWESOME SITE"),
              "my-awesome-site");
}

TEST(TenantServiceTest, NormalizeSlugDigitsPreserved) {
    EXPECT_EQ(TenantService::normalizeSlug("Site 42"), "site-42");
}

TEST(TenantServiceTest, NormalizeSlugAlreadyNormalized) {
    EXPECT_EQ(TenantService::normalizeSlug("hello-world"), "hello-world");
}

TEST(TenantServiceTest, NormalizeSlugEmptyInputReturnsEmpty) {
    EXPECT_EQ(TenantService::normalizeSlug(""), "");
}

// ── isValidDisplayName
// ────────────────────────────────────────────────────────

TEST(TenantServiceTest, DisplayNameValidNonEmpty) {
    EXPECT_TRUE(TenantService::isValidDisplayName("Acme Corp"));
}

TEST(TenantServiceTest, DisplayNameInvalidEmpty) {
    EXPECT_FALSE(TenantService::isValidDisplayName(""));
}

TEST(TenantServiceTest, DisplayNameInvalidWhitespaceOnly) {
    EXPECT_FALSE(TenantService::isValidDisplayName("   "));
}

TEST(TenantServiceTest, DisplayNameValidSingleChar) {
    EXPECT_TRUE(TenantService::isValidDisplayName("X"));
}
