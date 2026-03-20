#include <drogon/drogon.h>
#include <iostream>
#include "services/ArticleService.h"
#include "services/CacheService.h"
#include "services/ElasticsearchService.h"

int main() {
    // Load config from json file if it exists, otherwise use defaults
    auto &app = drogon::app();

    // Server config
    const char *host = std::getenv("SERVER_HOST");
    const char *port_str = std::getenv("SERVER_PORT");

    app.setLogLevel(trantor::Logger::kInfo);
    app.addListener(host ? host : "0.0.0.0",
                    port_str ? std::stoi(port_str) : 8080);
    app.setThreadNum(std::thread::hardware_concurrency());

    // Enable CORS for frontend
    // Use sync advice (fires before routing) to handle OPTIONS preflight
    app.registerSyncAdvice(
        [](const drogon::HttpRequestPtr &req) -> drogon::HttpResponsePtr {
            if (req->method() == drogon::Options) {
                auto resp = drogon::HttpResponse::newHttpResponse();
                resp->setStatusCode(drogon::k204NoContent);
                resp->addHeader("Access-Control-Allow-Origin", "*");
                resp->addHeader("Access-Control-Allow-Methods",
                                "GET, POST, PUT, DELETE, OPTIONS");
                resp->addHeader("Access-Control-Allow-Headers",
                                "Content-Type, Authorization");
                resp->addHeader("Access-Control-Max-Age", "86400");
                return resp;
            }
            return {};
        });
    // Add CORS headers to all responses
    app.registerPostHandlingAdvice(
        [](const drogon::HttpRequestPtr &req,
           const drogon::HttpResponsePtr &resp) {
            resp->addHeader("Access-Control-Allow-Origin", "*");
            resp->addHeader("Access-Control-Allow-Methods",
                            "GET, POST, PUT, DELETE, OPTIONS");
            resp->addHeader("Access-Control-Allow-Headers",
                            "Content-Type, Authorization");
        });

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
