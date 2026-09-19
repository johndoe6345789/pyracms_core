#include "services/search/SearchServiceInternal.h"

namespace pyracms {

void SearchService::search(const DbClientPtr &db, int tenantId,
                           const std::string &query, const std::string &type,
                           int limit, int offset, SearchResultsCb cb) {
    // GCOVR_EXCL_START (Elasticsearch/Redis glue: needs a live cluster)
    if (useElasticsearch()) {
        esSearch(tenantId, query, type, limit, offset, cb);
        return;
    }
    // GCOVR_EXCL_STOP

    // Fallback: PostgreSQL full-text search
    std::string tsQuery = toTsQuery(query);
    SearchResults empty;
    empty.query = query;
    empty.totalCount = 0;
    if (tsQuery.empty()) {
        cb(empty);
        return;
    }

    bool searchAll = type.empty() || type == "all";
    bool doArticles = searchAll || type == "article";
    bool doForumPosts =
        searchAll || type == "forum_post" || type == "post";
    bool doSnippets = searchAll || type == "snippet";
    bool doGameDeps = searchAll || type == "gamedep";
    int pending =
        int(doArticles) + int(doForumPosts) + int(doSnippets) + int(doGameDeps);
    if (pending == 0) {
        cb(empty);
        return;
    }

    auto collect = makeSearchCollector(query, pending, cb);
    if (doArticles)
        searchArticles(db, tenantId, tsQuery, limit, offset, collect);
    if (doForumPosts)
        searchForumPosts(db, tenantId, tsQuery, limit, offset, collect);
    if (doSnippets)
        searchSnippets(db, tenantId, tsQuery, limit, offset, collect);
    if (doGameDeps)
        searchGameDeps(db, tenantId, tsQuery, limit, offset, collect);
}

} // namespace pyracms
