#pragma once

#include <drogon/drogon.h>

namespace pyracms {

// Process bootstrap steps called from main(); each reads its own env vars.
void createDbClientFromEnv();
void initCacheAndSearch();
void startPublishTimer(drogon::HttpAppFramework &app);

} // namespace pyracms
