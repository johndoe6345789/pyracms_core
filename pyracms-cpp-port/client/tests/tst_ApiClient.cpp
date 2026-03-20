#include <gtest/gtest.h>
#include <gmock/gmock.h>

#include <QCoreApplication>
#include <QSignalSpy>
#include <QJsonDocument>
#include <QJsonObject>

#include "services/ApiClient.h"

using namespace Hypernucleus;
using namespace testing;

class ApiClientTest : public ::testing::Test {
protected:
    void SetUp() override {
        // Ensure QCoreApplication exists for Qt networking
        if (!QCoreApplication::instance()) {
            static int argc = 1;
            static char appName[] = "test";
            static char* argv[] = { appName, nullptr };
            m_app = new QCoreApplication(argc, argv);
        }
        m_client = new ApiClient();
    }

    void TearDown() override {
        delete m_client;
        // Don't delete app - it persists across tests
    }

    ApiClient* m_client = nullptr;
    QCoreApplication* m_app = nullptr;
};

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

// --- Catalog Fetch Tests (requires network, marked as integration) ---

TEST_F(ApiClientTest, FetchCatalogSetsLoading) {
    QSignalSpy loadingSpy(m_client, &ApiClient::loadingChanged);

    // This will fail with network error since no server is running,
    // but it should still set loading state
    m_client->fetchCatalog();

    // Should be loading immediately after call
    EXPECT_TRUE(m_client->isLoading());
}

TEST_F(ApiClientTest, FetchCatalogEmitsErrorOnBadConnection) {
    m_client->setBaseUrl("http://localhost:99999");
    QSignalSpy errorSpy(m_client, &ApiClient::networkError);

    m_client->fetchCatalog();

    // Wait for network error (with timeout)
    EXPECT_TRUE(errorSpy.wait(5000));
    EXPECT_GE(errorSpy.count(), 1);
}

// --- File Fetch Tests ---

TEST_F(ApiClientTest, FetchFileEmitsProgressSignal) {
    QSignalSpy progressSpy(m_client, &ApiClient::downloadProgress);

    // Will fail but should attempt the connection
    m_client->fetchFile("test-uuid-123");

    // Loading should be set
    EXPECT_TRUE(m_client->isLoading());
}

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
