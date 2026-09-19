#include <drogon/drogon.h>
#include <iostream>
#include "security/HttpSecurity.h"
#include "security/SecurityConfig.h"
#include "services/ArticleService.h"
#include "services/CacheService.h"
#include "services/ElasticsearchService.h"

int main() {
    // Refuse to run in production without a strong JWT_SECRET.
    auto secErr = pyracms::startupSecurityError();
    if (!secErr.empty()) {
        std::cerr << "FATAL: " << secErr << " (PYRACMS_ENV=production)"
                  << std::endl;
        return 1;
    }
    if (!std::getenv("JWT_SECRET"))
        std::cerr << "WARNING: JWT_SECRET not set; using a random "
                     "per-process secret (dev only)" << std::endl;
    // Load config from json file if it exists, otherwise use defaults
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

    // PostgreSQL database client
    const char *db_host = std::getenv("DB_HOST");
    const char *db_port_s = std::getenv("DB_PORT");
    const char *db_name = std::getenv("DB_NAME");
    const char *db_user = std::getenv("DB_USER");
    const char *db_pass = std::getenv("DB_PASSWORD");

    drogon::app().createDbClient(
        "postgresql",                           // dbType
        db_host ? db_host : "127.0.0.1",        // host
        db_port_s ? std::stoi(db_port_s) : 5432,// port
        db_name ? db_name : "pyracms",          // databaseName
        db_user ? db_user : "pyracms",          // userName
        db_pass ? db_pass : "pyracms",          // password
        4,                                      // connectionNum
        "",                                     // filename
        "default",                              // name
        false,                                  // isFast
        "utf8"                                  // characterSet
    );

    // Initialize Redis cache
    pyracms::CacheService::instance().initialize();
    if (pyracms::CacheService::instance().isConnected()) {
        std::cout << "Redis cache connected" << std::endl;
    } else {
        std::cout << "Redis not available — running without cache" << std::endl;
    }

    // Initialize Elasticsearch
    pyracms::ElasticsearchService::instance().initialize();
    if (pyracms::ElasticsearchService::instance().isConfigured()) {
        std::cout << "Elasticsearch connected — using ES for search" << std::endl;
    } else {
        std::cout << "Elasticsearch not configured — using PostgreSQL FTS" << std::endl;
    }

    // Scheduled publishing timer: check every 60 seconds
    app.getLoop()->runEvery(60.0, []() {
        auto db = drogon::app().getDbClient();
        static pyracms::ArticleService articleService;
        articleService.publishDueArticles(db,
            [](bool success, const std::string &msg) {
                if (success && msg != "0 articles published") {
                    LOG_INFO << "Scheduled publishing: " << msg;
                }
            });
    });

    std::cout << "PyraCMS Server starting on "
              << (host ? host : "0.0.0.0") << ":"
              << (port_str ? port_str : "8080") << std::endl;

    app.run();
    return 0;
}
