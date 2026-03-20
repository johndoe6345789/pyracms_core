#include <gtest/gtest.h>
#include "services/UserService.h"

// UserService tests that don't require a database connection
// Integration tests with real DB will be added separately

using namespace pyracms;

TEST(UserServiceTest, ServiceCanBeInstantiated) {
    UserService service;
    // Just verify it constructs without throwing
    SUCCEED();
}

// TODO: Add integration tests that spin up a test database
// These will test createUser, findByUsername, listUsers, etc.
// against a real PostgreSQL instance
