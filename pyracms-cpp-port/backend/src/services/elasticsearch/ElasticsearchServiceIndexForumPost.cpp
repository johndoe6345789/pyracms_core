#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::indexForumPost(int tenantId, int postId,
                                          const std::string &title,
                                          const std::string &content,
                                          int threadId,
                                          const std::string &createdAt) {
    Json::Value doc;
    doc["tenant_id"] = tenantId;
    doc["title"] = title;
    doc["content"] = content;
    doc["url"] = "/forum/thread/" + std::to_string(threadId);
    doc["type"] = "forum_post";
    doc["created_at"] = isoDate(createdAt);

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, doc);
    httpRequest("PUT", "/pyracms_forum_posts/_doc/" + std::to_string(postId),
                body);
}

} // namespace pyracms
