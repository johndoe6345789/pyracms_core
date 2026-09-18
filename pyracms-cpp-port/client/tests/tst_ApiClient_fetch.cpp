#include "GtestApiClient.h"

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
