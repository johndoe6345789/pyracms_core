#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

ElasticsearchService &ElasticsearchService::instance() {
    static ElasticsearchService inst;
    return inst;
}

} // namespace pyracms
