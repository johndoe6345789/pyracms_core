#include "services/ElasticsearchService.h"
#include "startup/Startup.h"

namespace pyracms {

// Moves content changes into the search index every couple of seconds.
void startSearchIndexer(drogon::HttpAppFramework &app) {
    app.getLoop()->runEvery(2.0, []() {
        ElasticsearchService::instance().drain(drogon::app().getDbClient());
    });
}

} // namespace pyracms
