#include <gtest/gtest.h>
#include "services/TenantService.h"

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

// ── isValidSlug ───────────────────────────────────────────────────────────────

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

// ── normalizeSlug ─────────────────────────────────────────────────────────────

TEST(TenantServiceTest, NormalizeSlugLowercases) {
    EXPECT_EQ(TenantService::normalizeSlug("Hello"), "hello");
}

TEST(TenantServiceTest, NormalizeSlugSpaceBecomesHyphen) {
    EXPECT_EQ(TenantService::normalizeSlug("Hello World"), "hello-world");
}

TEST(TenantServiceTest, NormalizeSlugMultipleSpacesCollapsed) {
    EXPECT_EQ(
        TenantService::normalizeSlug("Hello   World"),
        "hello-world");
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
    EXPECT_EQ(
        TenantService::normalizeSlug("MY AWESOME SITE"),
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

// ── isValidDisplayName ────────────────────────────────────────────────────────

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

// ── Slug uniqueness (pure-logic, no DB) ───────────────────────────────────────
// We verify the normalisation + validation pipeline that the controller
// would run before calling createTenant.

TEST(TenantServiceTest, SlugUniquenessCheckRequiresValidSlug) {
    // A slug produced by normalizeSlug must pass isValidSlug.
    const std::string raw   = "My New Site";
    const std::string slug  = TenantService::normalizeSlug(raw);
    EXPECT_TRUE(TenantService::isValidSlug(slug))
        << "Normalized slug '" << slug << "' failed isValidSlug";
}

TEST(TenantServiceTest, TwoDistinctNamesProduceDifferentSlugs) {
    auto slug1 = TenantService::normalizeSlug("Alpha Site");
    auto slug2 = TenantService::normalizeSlug("Beta Site");
    EXPECT_NE(slug1, slug2);
}

TEST(TenantServiceTest, SameNameNormalizedToSameSlug) {
    // Uniqueness violation would be detected at DB level; here we confirm
    // the same display name always yields the same candidate slug.
    EXPECT_EQ(
        TenantService::normalizeSlug("Hello World"),
        TenantService::normalizeSlug("Hello World"));
}

// TODO: Integration tests (require live Postgres)
// - createTenant with valid slug succeeds
// - createTenant with duplicate slug returns error
// - createTenant with empty displayName rejected at controller layer
// - findBySlug returns correct TenantDto
// - deleteTenant removes record
