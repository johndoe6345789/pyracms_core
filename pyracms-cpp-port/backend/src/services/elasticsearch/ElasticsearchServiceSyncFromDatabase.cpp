#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::syncFromDatabase(const DbClientPtr &db,
                                            int tenantId) {
    esSyncArticles(*this, db, tenantId);
    esSyncForumPosts(*this, db, tenantId);
    esSyncGameDeps(*this, db, tenantId);
}

} // namespace pyracms
