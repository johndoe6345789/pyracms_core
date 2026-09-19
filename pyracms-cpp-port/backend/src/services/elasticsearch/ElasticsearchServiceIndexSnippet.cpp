#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::indexSnippet(int tenantId, int snippetId,
                                        const std::string &title,
                                        const std::string &code,
                                        const std::string &language,
                                        const std::string &createdAt) {
    Json::Value doc;
    doc["tenant_id"] = tenantId;
    doc["title"] = title;
    doc["content"] = code;
    doc["name"] = language;
    doc["url"] = "/snippets/" + std::to_string(snippetId);
    doc["type"] = "snippet";
    doc["created_at"] = isoDate(createdAt);

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, doc);
    httpRequest("PUT", "/pyracms_snippets/_doc/" + std::to_string(snippetId),
                body);
}

} // namespace pyracms
