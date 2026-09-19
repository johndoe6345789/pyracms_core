#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "startup/Startup.h"

#include <iostream>

namespace pyracms {

void initCacheAndSearch() {
    // Initialize Redis cache
    CacheService::instance().initialize();
    if (CacheService::instance().isConnected()) {
        std::cout << "Redis cache connected" << std::endl;
    } else {
        std::cout << "Redis not available — running without cache" << std::endl;
    }

    // Initialize Elasticsearch
    ElasticsearchService::instance().initialize();
    if (ElasticsearchService::instance().isConfigured()) {
        std::cout << "Elasticsearch connected — using ES for search"
                  << std::endl;
    } else {
        std::cout << "Elasticsearch not configured — using PostgreSQL FTS"
                  << std::endl;
    }
}

} // namespace pyracms
