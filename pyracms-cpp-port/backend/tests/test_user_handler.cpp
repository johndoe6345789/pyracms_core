#include <gtest/gtest.h>
#include "user_handler.h"
#include <memory>

using namespace pyracms;

class UserHandlerTest : public ::testing::Test {
protected:
    void SetUp() override {
        db = std::make_shared<Database>("sqlite::memory:");
        auth = std::make_shared<AuthHandler>();
        user_handler = std::make_unique<UserHandler>(db, auth);
    }

    void TearDown() override {
        user_handler.reset();
    }

    std::shared_ptr<Database> db;
    std::shared_ptr<AuthHandler> auth;
    std::unique_ptr<UserHandler> user_handler;
};

TEST_F(UserHandlerTest, HandleLoginReturnsResponse) {
    std::string request = R"({"username":"test","password":"pass"})";
    std::string response = user_handler->handleLogin(request);
    
    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("error"), std::string::npos);
}

TEST_F(UserHandlerTest, HandleLogoutReturnsResponse) {
    std::string token = "test_token";
    std::string response = user_handler->handleLogout(token);
    
    EXPECT_FALSE(response.empty());
}

TEST_F(UserHandlerTest, HandleRegisterReturnsResponse) {
    std::string request = R"({"username":"newuser","email":"new@example.com","password":"pass123"})";
    std::string response = user_handler->handleRegister(request);
    
    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("error"), std::string::npos);
}

TEST_F(UserHandlerTest, HandleGetProfileReturnsResponse) {
    std::string response = user_handler->handleGetProfile(1);
    
    EXPECT_FALSE(response.empty());
}

TEST_F(UserHandlerTest, HandleUpdateProfileReturnsResponse) {
    std::string request = R"({"firstName":"John","lastName":"Doe"})";
    std::string response = user_handler->handleUpdateProfile(1, request);
    
    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("error"), std::string::npos);
}

TEST_F(UserHandlerTest, HandleListUsersReturnsResponse) {
    std::string response = user_handler->handleListUsers(10, 0);
    
    EXPECT_FALSE(response.empty());
    EXPECT_NE(response.find("error"), std::string::npos);
}
