#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

Json::Value ElasticsearchService::parseJson(const std::string &str) {
    Json::Value root;
    Json::CharReaderBuilder reader;
    std::istringstream stream(str);
    std::string errors;
    Json::parseFromStream(reader, stream, &root, &errors);
    return root;
}

} // namespace pyracms
