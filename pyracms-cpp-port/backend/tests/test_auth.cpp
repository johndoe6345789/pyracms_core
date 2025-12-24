#include <gtest/gtest.h>
#include "auth_handler.h"

using namespace pyracms;

class AuthHandlerTest : public ::testing::Test {
protected:
    void SetUp() override {
        auth_handler = std::make_unique<AuthHandler>();
    }

    void TearDown() override {
        auth_handler.reset();
    }

    std::unique_ptr<AuthHandler> auth_handler;
};

TEST_F(AuthHandlerTest, HashPasswordGeneratesHash) {
    std::string password = "test_password_123";
    std::string hash = auth_handler->hashPassword(password);
    
    EXPECT_FALSE(hash.empty());
    EXPECT_NE(hash, password);
}

TEST_F(AuthHandlerTest, VerifyPasswordWorksCorrectly) {
    std::string password = "test_password_123";
    std::string hash = auth_handler->hashPassword(password);
    
    EXPECT_TRUE(auth_handler->verifyPassword(password, hash));
    EXPECT_FALSE(auth_handler->verifyPassword("wrong_password", hash));
}

TEST_F(AuthHandlerTest, GenerateTokenCreatesToken) {
    std::string token = auth_handler->generateToken("testuser", 1);
    
    EXPECT_FALSE(token.empty());
    EXPECT_GT(token.length(), 10);
}

TEST_F(AuthHandlerTest, GenerateTokenProducesDifferentTokensForDifferentUsers) {
    std::string token1 = auth_handler->generateToken("user1", 1);
    std::string token2 = auth_handler->generateToken("user2", 2);
    
    EXPECT_NE(token1, token2);
}

TEST_F(AuthHandlerTest, CreateSessionReturnsTrue) {
    std::string token = auth_handler->generateToken("testuser", 1);
    bool result = auth_handler->createSession(1, token);
    
    EXPECT_TRUE(result);
}

TEST_F(AuthHandlerTest, InvalidateSessionDoesNotThrow) {
    std::string token = "test_token";
    EXPECT_NO_THROW(auth_handler->invalidateSession(token));
}
