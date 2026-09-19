#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::indexArticle(int tenantId, int articleId,
                                        const std::string &name,
                                        const std::string &displayName,
                                        const std::string &content,
                                        const std::string &createdAt) {
    Json::Value doc;
    doc["tenant_id"] = tenantId;
    doc["title"] = displayName;
    doc["content"] = content;
    doc["name"] = name;
    doc["url"] = "/articles/" + name;
    doc["type"] = "article";
    doc["created_at"] = isoDate(createdAt);

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, doc);
    httpRequest("PUT", "/pyracms_articles/_doc/" + std::to_string(articleId),
                body);
}

} // namespace pyracms
