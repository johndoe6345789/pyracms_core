#include <gtest/gtest.h>
#include "services/AuthService.h"

using namespace pyracms;

class AuthServiceTest : public ::testing::Test {
protected:
    AuthService auth;
};

TEST_F(AuthServiceTest, HashPasswordProducesColonSeparatedFormat) {
    auto hash = auth.hashPassword("testpassword");
    // Format should be "salt_hex:hash_hex"
    EXPECT_NE(hash.find(':'), std::string::npos);
}

TEST_F(AuthServiceTest, HashPasswordProducesDifferentHashesEachTime) {
    // Due to random salt, same password should produce different hashes
    auto hash1 = auth.hashPassword("testpassword");
    auto hash2 = auth.hashPassword("testpassword");
    EXPECT_NE(hash1, hash2);
}

TEST_F(AuthServiceTest, VerifyPasswordCorrect) {
    auto hash = auth.hashPassword("mypassword");
    EXPECT_TRUE(auth.verifyPassword("mypassword", hash));
}

TEST_F(AuthServiceTest, VerifyPasswordIncorrect) {
    auto hash = auth.hashPassword("mypassword");
    EXPECT_FALSE(auth.verifyPassword("wrongpassword", hash));
}

TEST_F(AuthServiceTest, VerifyPasswordEmptyHash) {
    EXPECT_FALSE(auth.verifyPassword("password", ""));
}

TEST_F(AuthServiceTest, VerifyPasswordMalformedHash) {
    EXPECT_FALSE(auth.verifyPassword("password", "nocolonhere"));
}

TEST_F(AuthServiceTest, GenerateTokenReturnsNonEmptyString) {
    auto token = auth.generateToken(1, "testuser");
    EXPECT_FALSE(token.empty());
}

TEST_F(AuthServiceTest, VerifyValidToken) {
    auto token = auth.generateToken(42, "alice");
    auto payload = auth.verifyToken(token);
    ASSERT_TRUE(payload.has_value());
    EXPECT_EQ(payload->userId, 42);
    EXPECT_EQ(payload->username, "alice");
}

TEST_F(AuthServiceTest, VerifyInvalidTokenReturnsNullopt) {
    auto payload = auth.verifyToken("this.is.not.a.valid.token");
    EXPECT_FALSE(payload.has_value());
}

TEST_F(AuthServiceTest, VerifyEmptyTokenReturnsNullopt) {
    auto payload = auth.verifyToken("");
    EXPECT_FALSE(payload.has_value());
}

TEST_F(AuthServiceTest, GenerateRandomTokenIsUnique) {
    auto token1 = auth.generateRandomToken();
    auto token2 = auth.generateRandomToken();
    EXPECT_NE(token1, token2);
    EXPECT_EQ(token1.length(), 64u); // 32 bytes = 64 hex chars
}

TEST_F(AuthServiceTest, GenerateRandomTokenIsHex) {
    auto token = auth.generateRandomToken();
    for (char c : token) {
        EXPECT_TRUE((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))
            << "Non-hex character: " << c;
    }
}
