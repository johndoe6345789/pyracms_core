#include "services/TenantService.h"

#include <gtest/gtest.h>

// Unit tests for TenantService pure-logic methods.
// All tests here are DB-free: they exercise static helpers only.
// Integration tests that spin up a real Postgres instance are
// tracked separately (see TODO at end of file).

using namespace pyracms;

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
