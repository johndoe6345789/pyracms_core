#include "services/TenantService.h"

#include <gtest/gtest.h>

// Unit tests for TenantService pure-logic methods.
// All tests here are DB-free: they exercise static helpers only.
// Integration tests that spin up a real Postgres instance are
// tracked separately (see TODO at end of file).

using namespace pyracms;

// ── Instantiation ────────────────────────────────────────────────────────────

TEST(TenantServiceTest, ServiceCanBeInstantiated) {
    TenantService svc;
    SUCCEED();
}

// ── isValidSlug
// ───────────────────────────────────────────────────────────────

TEST(TenantServiceTest, ValidSlugLowercaseLetters) {
    EXPECT_TRUE(TenantService::isValidSlug("hello"));
}

TEST(TenantServiceTest, ValidSlugWithHyphen) {
    EXPECT_TRUE(TenantService::isValidSlug("hello-world"));
}

TEST(TenantServiceTest, ValidSlugWithDigits) {
    EXPECT_TRUE(TenantService::isValidSlug("tenant42"));
}

TEST(TenantServiceTest, ValidSlugMixed) {
    EXPECT_TRUE(TenantService::isValidSlug("my-site-2024"));
}

TEST(TenantServiceTest, InvalidSlugEmpty) {
    EXPECT_FALSE(TenantService::isValidSlug(""));
}

TEST(TenantServiceTest, InvalidSlugWithSpace) {
    EXPECT_FALSE(TenantService::isValidSlug("hello world"));
}

TEST(TenantServiceTest, InvalidSlugUppercase) {
    EXPECT_FALSE(TenantService::isValidSlug("Hello"));
}

TEST(TenantServiceTest, InvalidSlugSpecialChar) {
    EXPECT_FALSE(TenantService::isValidSlug("my_site"));
}

TEST(TenantServiceTest, InvalidSlugLeadingHyphen) {
    EXPECT_FALSE(TenantService::isValidSlug("-hello"));
}

TEST(TenantServiceTest, InvalidSlugTrailingHyphen) {
    EXPECT_FALSE(TenantService::isValidSlug("hello-"));
}

TEST(TenantServiceTest, InvalidSlugDot) {
    EXPECT_FALSE(TenantService::isValidSlug("my.site"));
}

TEST(TenantServiceTest, InvalidSlugSlash) {
    EXPECT_FALSE(TenantService::isValidSlug("my/site"));
}

// ── normalizeSlug
// ─────────────────────────────────────────────────────────────

TEST(TenantServiceTest, NormalizeSlugLowercases) {
    EXPECT_EQ(TenantService::normalizeSlug("Hello"), "hello");
}
