#include "services/CacheService.h"
#include "services/ElasticsearchService.h"
#include "services/SearchService.h"

#include <cctype>
#include <memory>
#include <mutex>

namespace pyracms {

bool SearchService::useElasticsearch() {
    const char *engine = std::getenv("SEARCH_ENGINE");
    return engine && std::string(engine) == "elasticsearch" &&
           ElasticsearchService::instance().isConfigured();
}

} // namespace pyracms
