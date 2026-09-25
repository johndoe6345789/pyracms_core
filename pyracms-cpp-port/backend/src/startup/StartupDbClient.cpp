#include "startup/Startup.h"

#include <algorithm>
#include <thread>

namespace pyracms {

static int envInt(const char *name, int fallback, int lo, int hi) {
    const char *v = std::getenv(name);
    if (!v || !*v)
        return fallback;
    try {
        return std::clamp(std::stoi(v), lo, hi);
    } catch (const std::exception &) {
        return fallback;
    }
}

int serverThreadCount() {
    int cores = static_cast<int>(std::thread::hardware_concurrency());
    return envInt("SERVER_THREADS", std::max(2, cores), 1, 256);
}

int dbPoolSize() {
    return envInt("DB_POOL_SIZE", std::clamp(2 * serverThreadCount(), 8, 32),
                  1, 64);
}

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
                                 dbPoolSize(),                  // connections
                                 "",                            // filename
                                 "default",                     // name
                                 false,                         // isFast
                                 "utf8"                         // characterSet
    );
}

} // namespace pyracms
