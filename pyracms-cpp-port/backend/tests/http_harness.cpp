#include "http_harness.h"

#include <gtest/gtest.h>

#include "fake_s3.h"
#include "filters/FeatureGate.h"
#include "security/HttpSecurity.h"
#include "security/RateLimiter.h"

namespace harness {

static const int kPort = 3299;

Server::Server() {
    // Tests create many accounts from one address and call webhooks on
    // loopback: rate limits are off and private URLs allowed (both are
    // switched on again by the tests that exercise them).
    pyracms::RateLimiter::setEnabled(false);
    setenv("PYRACMS_ALLOW_PRIVATE_URLS", "1", 1);
    auto &app = drogon::app();
    pyracms::installHttpSecurity(app);
    pyracms::installFeatureGate(app);
    FakeS3::install(app);
    app.addListener("127.0.0.1", kPort)
        .setThreadNum(2)
        .setLogLevel(trantor::Logger::kError);
    app.createDbClient("postgresql", dbEnv("TEST_DB_HOST", ""),
                       std::stoi(dbEnv("TEST_DB_PORT", "5432")),
                       dbEnv("TEST_DB_NAME", "pyracms_test"),
                       dbEnv("TEST_DB_USER", "pyracms"),
                       dbEnv("TEST_DB_PASSWORD", "pyracms"), 2, "",
                       "default", false, "utf8");
    thread_ = std::thread([] { drogon::app().run(); });
    while (!drogon::app().isRunning())
        usleep(10000);
    usleep(200000);
    loop_.run();
    client = drogon::HttpClient::newHttpClient(
        "http://127.0.0.1:" + std::to_string(kPort), loop_.getLoop());
}

void Server::stop() {
    if (!thread_.joinable())
        return;
    client.reset();
    drogon::app().quit();
    thread_.join();
}

Server::~Server() { stop(); }

static Server *created = nullptr;

Server &server() {
    static Server s;
    created = &s;
    return s;
}

namespace {
// Runs after the last test, before any static object is destroyed.
class StopServer : public ::testing::Environment {
  public:
    void TearDown() override {
        if (created)
            created->stop();
    }
};
const auto *const kStopServer =
    ::testing::AddGlobalTestEnvironment(new StopServer);
} // namespace

} // namespace harness
