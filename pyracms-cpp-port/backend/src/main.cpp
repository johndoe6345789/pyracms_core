#include "filters/FeatureGate.h"
#include "security/HttpSecurity.h"
#include "security/SecurityConfig.h"
#include "startup/Startup.h"
#include "storage/StorageConfig.h"

#include <drogon/drogon.h>
#include <iostream>

int main() {
    // Refuse to run in production without a strong JWT_SECRET.
    auto secErr = pyracms::startupSecurityError();
    if (!secErr.empty()) {
        std::cerr << "FATAL: " << secErr << " (PYRACMS_ENV=production)"
                  << std::endl;
        return 1;
    }
    auto storageErr = pyracms::startupStorageError();
    if (!storageErr.empty()) {
        std::cerr << "FATAL: " << storageErr << std::endl;
        return 1;
    }
    if (!std::getenv("JWT_SECRET"))
        std::cerr << "WARNING: JWT_SECRET not set; using a random "
                     "per-process secret (dev only)"
                  << std::endl;
    auto &app = drogon::app();

    // Server config
    const char *host = std::getenv("SERVER_HOST");
    const char *port_str = std::getenv("SERVER_PORT");

    app.setLogLevel(trantor::Logger::kInfo);
    app.addListener(host ? host : "0.0.0.0",
                    port_str ? std::stoi(port_str) : 8080);
    app.setThreadNum(std::thread::hardware_concurrency());

    // CORS, security headers, body limits, generic error handler
    pyracms::installHttpSecurity(app);
    pyracms::installFeatureGate(app);
    pyracms::createDbClientFromEnv();
    pyracms::initCacheAndSearch();
    pyracms::startPublishTimer(app);

    std::cout << "PyraCMS Server starting on " << (host ? host : "0.0.0.0")
              << ":" << (port_str ? port_str : "8080") << std::endl;

    app.run();
    return 0;
}
