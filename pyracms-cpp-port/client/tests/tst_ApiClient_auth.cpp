#include "GtestApiClient.h"

// --- Login Tests ---

TEST_F(ApiClientTest, LoginSetsLoading) {
    m_client->login("testuser", "testpass");
    EXPECT_TRUE(m_client->isLoading());
}

TEST_F(ApiClientTest, LoginEmitsResponseOnBadConnection) {
    m_client->setBaseUrl("http://localhost:99999");
    QSignalSpy responseSpy(m_client, &ApiClient::loginResponse);

    m_client->login("testuser", "testpass");

    EXPECT_TRUE(responseSpy.wait(5000));
    QList<QVariant> args = responseSpy.takeFirst();
    EXPECT_FALSE(args.at(0).toBool()); // success = false
}

// --- Register Tests ---

TEST_F(ApiClientTest, RegisterSetsLoading) {
    m_client->registerUser("newuser", "test@example.com", "password123");
    EXPECT_TRUE(m_client->isLoading());
}

TEST_F(ApiClientTest, RegisterEmitsResponseOnBadConnection) {
    m_client->setBaseUrl("http://localhost:99999");
    QSignalSpy responseSpy(m_client, &ApiClient::registerResponse);

    m_client->registerUser("newuser", "test@example.com", "password123");

    EXPECT_TRUE(responseSpy.wait(5000));
    QList<QVariant> args = responseSpy.takeFirst();
    EXPECT_FALSE(args.at(0).toBool()); // success = false
}
