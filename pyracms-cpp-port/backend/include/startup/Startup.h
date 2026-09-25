#pragma once

#include <drogon/drogon.h>

namespace pyracms {

// Process bootstrap steps called from main(); each reads its own env vars.
void createDbClientFromEnv();
void initCacheAndSearch();
void startPublishTimer(drogon::HttpAppFramework &app);
void startUploadSweep(drogon::HttpAppFramework &app);
void startSearchIndexer(drogon::HttpAppFramework &app);

} // namespace pyracms
