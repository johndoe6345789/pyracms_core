#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

size_t ElasticsearchService::curlWriteCallback(char *ptr, size_t size,
                                               size_t nmemb,
                                               std::string *data) {
    data->append(ptr, size * nmemb);
    return size * nmemb;
}

} // namespace pyracms
