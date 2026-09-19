#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::indexGameDep(int tenantId, int pageId,
                                        const std::string &name,
                                        const std::string &displayName,
                                        const std::string &description,
                                        const std::string &createdAt) {
    Json::Value doc;
    doc["tenant_id"] = tenantId;
    doc["title"] = displayName;
    doc["content"] = description;
    doc["name"] = name;
    doc["url"] = "/gamedep/" + name;
    doc["type"] = "gamedep";
    doc["created_at"] = isoDate(createdAt);

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, doc);
    httpRequest("PUT", "/pyracms_gamedeps/_doc/" + std::to_string(pageId),
                body);
}

} // namespace pyracms
