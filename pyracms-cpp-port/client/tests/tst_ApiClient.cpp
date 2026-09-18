#include "GtestApiClient.h"

// --- URL Construction Tests ---

TEST_F(ApiClientTest, DefaultBaseUrl) {
    EXPECT_EQ(m_client->baseUrl(), QString("http://localhost:8080"));
}

TEST_F(ApiClientTest, SetBaseUrl) {
    m_client->setBaseUrl("https://example.com");
    EXPECT_EQ(m_client->baseUrl(), QString("https://example.com"));
}

TEST_F(ApiClientTest, SetBaseUrlEmitsSignal) {
    QSignalSpy spy(m_client, &ApiClient::baseUrlChanged);
    m_client->setBaseUrl("https://new-url.com");
    EXPECT_EQ(spy.count(), 1);
}

TEST_F(ApiClientTest, SetSameBaseUrlDoesNotEmit) {
    m_client->setBaseUrl("http://localhost:8080");
    QSignalSpy spy(m_client, &ApiClient::baseUrlChanged);
    m_client->setBaseUrl("http://localhost:8080");
    EXPECT_EQ(spy.count(), 0);
}

// --- Token Management Tests ---

TEST_F(ApiClientTest, InitiallyHasNoToken) {
    EXPECT_FALSE(m_client->hasToken());
}

TEST_F(ApiClientTest, SetToken) {
    m_client->setToken("test-jwt-token");
    EXPECT_TRUE(m_client->hasToken());
}

TEST_F(ApiClientTest, ClearToken) {
    m_client->setToken("test-jwt-token");
    EXPECT_TRUE(m_client->hasToken());
    m_client->clearToken();
    EXPECT_FALSE(m_client->hasToken());
}

// --- Loading State Tests ---

TEST_F(ApiClientTest, InitiallyNotLoading) {
    EXPECT_FALSE(m_client->isLoading());
}

TEST_F(ApiClientTest, NoInitialError) {
    EXPECT_TRUE(m_client->error().isEmpty());
}
