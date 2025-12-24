#include <gtest/gtest.h>
#include "database.h"

using namespace pyracms;

class DatabaseTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Use in-memory SQLite for testing
        db = std::make_unique<Database>("sqlite::memory:");
    }

    void TearDown() override {
        db.reset();
    }

    std::unique_ptr<Database> db;
};

TEST_F(DatabaseTest, ConnectSucceeds) {
    bool result = db->connect();
    EXPECT_TRUE(result);
    EXPECT_TRUE(db->isConnected());
}

TEST_F(DatabaseTest, DisconnectWorks) {
    db->connect();
    EXPECT_TRUE(db->isConnected());
    
    db->disconnect();
    EXPECT_FALSE(db->isConnected());
}

TEST_F(DatabaseTest, MigrateSucceedsWhenConnected) {
    db->connect();
    bool result = db->migrate();
    EXPECT_TRUE(result);
}

TEST_F(DatabaseTest, MigrateFailsWhenNotConnected) {
    bool result = db->migrate();
    EXPECT_FALSE(result);
}

TEST_F(DatabaseTest, GetUserByIdReturnsNulloptWhenNotConnected) {
    auto user = db->getUserById(1);
    EXPECT_FALSE(user.has_value());
}

TEST_F(DatabaseTest, GetUserByUsernameReturnsNulloptWhenNotConnected) {
    auto user = db->getUserByUsername("testuser");
    EXPECT_FALSE(user.has_value());
}

TEST_F(DatabaseTest, GetUserByEmailReturnsNulloptWhenNotConnected) {
    auto user = db->getUserByEmail("test@example.com");
    EXPECT_FALSE(user.has_value());
}

TEST_F(DatabaseTest, CreateUserReturnsFalseWhenNotConnected) {
    User user{0, "testuser", "test@example.com", "hash", "", true};
    bool result = db->createUser(user);
    EXPECT_FALSE(result);
}

TEST_F(DatabaseTest, UpdateUserReturnsFalseWhenNotConnected) {
    User user{1, "testuser", "test@example.com", "hash", "", true};
    bool result = db->updateUser(user);
    EXPECT_FALSE(result);
}

TEST_F(DatabaseTest, DeleteUserReturnsFalseWhenNotConnected) {
    bool result = db->deleteUser(1);
    EXPECT_FALSE(result);
}

TEST_F(DatabaseTest, ListUsersReturnsEmptyWhenNotConnected) {
    auto users = db->listUsers();
    EXPECT_TRUE(users.empty());
}
