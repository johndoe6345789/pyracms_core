#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::deleteDocument(const std::string &index, int id) {
    httpRequest("DELETE", "/" + index + "/_doc/" + std::to_string(id));
}

} // namespace pyracms
