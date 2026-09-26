#pragma once

#include "services/SearchTypes.h"

#include <drogon/drogon.h>
#include <functional>
#include <map>
#include <string>
#include <vector>

namespace pyracms {

class SearchService {
  public:
    using DbClientPtr = drogon::orm::DbClientPtr;

    void search(const DbClientPtr &db, int tenantId, const std::string &query,
                const std::string &type, int limit, int offset,
                std::function<void(const SearchResults &)> cb);

    void
    autocomplete(const DbClientPtr &db, int tenantId, const std::string &prefix,
                 int limit,
                 std::function<void(const std::vector<AutocompleteItem> &)> cb);
    static bool useElasticsearch(); // Elasticsearch is the active engine

  private:
    // PostgreSQL engines: the default, and the Elasticsearch fallback.
    void searchPostgres(const DbClientPtr &db, int tenantId,
                        const std::string &query, const std::string &type,
                        int limit, int offset,
                        std::function<void(const SearchResults &)> cb);
    void autocompletePostgres(
        const DbClientPtr &db, int tenantId, const std::string &prefix,
        int limit,
        std::function<void(const std::vector<AutocompleteItem> &)> cb);

    void searchArticles(
        const DbClientPtr &db, int tenantId, const std::string &tsQuery,
        int limit, int offset,
        std::function<void(const std::vector<SearchResultItem> &, int)> cb);

    void searchForumPosts(
        const DbClientPtr &db, int tenantId, const std::string &tsQuery,
        int limit, int offset,
        std::function<void(const std::vector<SearchResultItem> &, int)> cb);

    void searchSnippets(
        const DbClientPtr &db, int tenantId, const std::string &tsQuery,
        int limit, int offset,
        std::function<void(const std::vector<SearchResultItem> &, int)> cb);

    void searchGameDeps(
        const DbClientPtr &db, int tenantId, const std::string &tsQuery,
        int limit, int offset,
        std::function<void(const std::vector<SearchResultItem> &, int)> cb);
};

} // namespace pyracms
