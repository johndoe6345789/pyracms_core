#include "startup/Startup.h"

namespace pyracms {

void createDbClientFromEnv() {
    const char *db_host = std::getenv("DB_HOST");
    const char *db_port_s = std::getenv("DB_PORT");
    const char *db_name = std::getenv("DB_NAME");
    const char *db_user = std::getenv("DB_USER");
    const char *db_pass = std::getenv("DB_PASSWORD");

    drogon::app().createDbClient("postgresql",                    // dbType
                                 db_host ? db_host : "127.0.0.1", // host
                                 db_port_s ? std::stoi(db_port_s)
                                           : 5432,              // port
                                 db_name ? db_name : "pyracms", // databaseName
                                 db_user ? db_user : "pyracms", // userName
                                 db_pass ? db_pass : "pyracms", // password
                                 4,                             // connectionNum
                                 "",                            // filename
                                 "default",                     // name
                                 false,                         // isFast
                                 "utf8"                         // characterSet
    );
}

} // namespace pyracms
