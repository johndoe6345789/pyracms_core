#pragma once

#include <drogon/drogon.h>

namespace pyracms {

// Process bootstrap steps called from main(); each reads its own env vars.
// SERVER_THREADS, else one per core (at least 2).
int serverThreadCount();
// DB_POOL_SIZE connections, else 2 per thread (8..32).
int dbPoolSize();
void createDbClientFromEnv();
void initCacheAndSearch();
void startWsRelay();
void startPublishTimer(drogon::HttpAppFramework &app);
void startUploadSweep(drogon::HttpAppFramework &app);
void startSearchIndexer(drogon::HttpAppFramework &app);

} // namespace pyracms
