#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::initialize() {
    const char *url = std::getenv("ELASTICSEARCH_URL");
    if (url && std::string(url).length() > 0) {
        esUrl_ = url;
        configured_ = true;
        createIndexes();
        LOG_INFO << "Elasticsearch configured at " << esUrl_;
    }
}

} // namespace pyracms
