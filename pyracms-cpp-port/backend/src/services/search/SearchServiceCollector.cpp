#include "services/search/SearchServiceInternal.h"

#include <algorithm>
#include <memory>
#include <mutex>

namespace pyracms {

namespace {
struct CollectorState {
    std::mutex mu;
    SearchResults results;
    int pendingQueries;
    SearchResultsCb cb;
};
} // namespace

SearchItemsCb makeSearchCollector(const std::string &query, int pending,
                                  SearchResultsCb cb) {
    auto state = std::make_shared<CollectorState>();
    state->results.query = query;
    state->results.totalCount = 0;
    state->pendingQueries = pending;
    state->cb = cb;
    return [state](const std::vector<SearchResultItem> &items, int count) {
        std::lock_guard<std::mutex> lock(state->mu);
        for (const auto &item : items) {
            state->results.items.push_back(item);
        }
        state->results.totalCount += count;
        // Build facet counts
        if (!items.empty()) {
            state->results.facets[items[0].type] += count;
        }
        state->pendingQueries--;
        if (state->pendingQueries == 0) {
            // Sort by rank descending
            std::sort(state->results.items.begin(), state->results.items.end(),
                      [](const SearchResultItem &a, const SearchResultItem &b) {
                          return a.rank > b.rank;
                      });
            state->cb(state->results);
        }
    };
}

} // namespace pyracms
