#pragma once

#include "services/SearchService.h"

#include <functional>
#include <string>
#include <vector>

namespace pyracms {

using SearchItemsCb =
    std::function<void(const std::vector<SearchResultItem> &, int)>;
using SearchResultsCb = std::function<void(const SearchResults &)>;

// Only letters/digits survive; result is a to_tsquery "a:* & b:*" string.
std::string toTsQuery(const std::string &query);

// Merges the per-type PostgreSQL searches into one ranked SearchResults.
SearchItemsCb makeSearchCollector(const std::string &query, int pending,
                                  SearchResultsCb cb);

// Elasticsearch (+ Redis cache) paths, used when SEARCH_ENGINE selects it.
void esSearch(int tenantId, const std::string &query, const std::string &type,
              int limit, int offset, SearchResultsCb cb,
              std::function<void()> unavailable);
bool esParseCachedSearch(const std::string &cached, SearchResults &out);
std::string esSerializeSearch(const SearchResults &results);
void esAutocomplete(
    int tenantId, const std::string &prefix, int limit,
    std::function<void(const std::vector<AutocompleteItem> &)> cb,
    std::function<void()> unavailable);

} // namespace pyracms
