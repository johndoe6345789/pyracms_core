#include "services/ElasticsearchService.h"

namespace pyracms {

ElasticsearchService &ElasticsearchService::instance() {
    static ElasticsearchService svc;
    return svc;
}

void ElasticsearchService::initialize() {
    const char *url = std::getenv("ELASTICSEARCH_URL");
    if (url && *url) {
        url_ = url;
        configured_ = true;
        LOG_INFO << "Elasticsearch configured at " << url_;
    }
}

} // namespace pyracms
