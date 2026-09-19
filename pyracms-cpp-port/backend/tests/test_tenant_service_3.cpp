#include "services/TenantService.h"

#include <gtest/gtest.h>

// Unit tests for TenantService pure-logic methods.
// All tests here are DB-free: they exercise static helpers only.
// Integration tests that spin up a real Postgres instance are
// tracked separately (see TODO at end of file).

using namespace pyracms;

// ── Slug uniqueness (pure-logic, no DB)
// ─────────────────────────────────────── We verify the normalisation +
// validation pipeline that the controller would run before calling
// createTenant.

TEST(TenantServiceTest, SlugUniquenessCheckRequiresValidSlug) {
    // A slug produced by normalizeSlug must pass isValidSlug.
    const std::string raw = "My New Site";
    const std::string slug = TenantService::normalizeSlug(raw);
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
    EXPECT_EQ(TenantService::normalizeSlug("Hello World"),
              TenantService::normalizeSlug("Hello World"));
}

// TODO: Integration tests (require live Postgres)
// - createTenant with valid slug succeeds
// - createTenant with duplicate slug returns error
// - createTenant with empty displayName rejected at controller layer
// - findBySlug returns correct TenantDto
// - deleteTenant removes record
