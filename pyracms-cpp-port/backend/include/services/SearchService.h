#pragma once

#include <drogon/drogon.h>
#include <functional>
#include <map>
#include <string>
#include <vector>

namespace pyracms {

struct SearchResultItem {
    std::string type;       // "article", "forum_post", "snippet", "gamedep"
    int id;
    std::string title;
    std::string snippet;    // highlighted excerpt
    std::string url;
    double rank;
    std::string createdAt;
};

struct SearchResults {
    std::vector<SearchResultItem> items;
    int totalCount;
    std::string query;
    std::map<std::string, int> facets;  // type -> count
};

struct AutocompleteItem {
    std::string text;
    std::string type;
    std::string url;
};

class SearchService {
public:
    using DbClientPtr = drogon::orm::DbClientPtr;

    void search(const DbClientPtr &db, int tenantId,
                const std::string &query, const std::string &type,
                int limit, int offset,
                std::function<void(const SearchResults &)> cb);

    void autocomplete(const DbClientPtr &db, int tenantId,
                      const std::string &prefix, int limit,
                      std::function<void(const std::vector<AutocompleteItem> &)> cb);

    // Check if Elasticsearch is the active search engine
    static bool useElasticsearch();

private:
    void searchArticles(const DbClientPtr &db, int tenantId,
                        const std::string &tsQuery, int limit, int offset,
                        std::function<void(const std::vector<SearchResultItem> &, int)> cb);

    void searchForumPosts(const DbClientPtr &db, int tenantId,
                          const std::string &tsQuery, int limit, int offset,
                          std::function<void(const std::vector<SearchResultItem> &, int)> cb);

    void searchSnippets(const DbClientPtr &db, int tenantId,
                        const std::string &tsQuery, int limit, int offset,
                        std::function<void(const std::vector<SearchResultItem> &, int)> cb);

    void searchGameDeps(const DbClientPtr &db, int tenantId,
                        const std::string &tsQuery, int limit, int offset,
                        std::function<void(const std::vector<SearchResultItem> &, int)> cb);
};

} // namespace pyracms
