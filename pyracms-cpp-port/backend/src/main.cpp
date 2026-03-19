#include <drogon/drogon.h>
#include <iostream>

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
        1,                                      // connectionNum
        "",                                     // filename
        "default",                              // name
        false,                                  // isFast
        "utf8"                                  // characterSet
    );

    std::cout << "PyraCMS Server starting on "
              << (host ? host : "0.0.0.0") << ":"
              << (port_str ? port_str : "8080") << std::endl;

    app.run();
    return 0;
}
