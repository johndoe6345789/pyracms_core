#pragma once

#include <map>
#include <string>
#include <vector>

namespace pyracms {

struct SearchResultItem {
    std::string type; // "article", "forum_post", "snippet", "gamedep"
    int id;
    std::string title;
    std::string snippet; // excerpt, matches wrapped in U+E000 / U+E001
    std::string url;
    double rank;
    std::string createdAt;
    std::string titleMarked; // the title with matches marked, "" if none
    std::string author;
    std::vector<std::string> tags;
};

struct SearchResults {
    std::vector<SearchResultItem> items;
    int totalCount;
    std::string query;
    std::map<std::string, int> facets; // type -> count
};

struct AutocompleteItem {
    std::string text;
    std::string type;
    std::string url;
    std::string snippet; // marked like SearchResultItem::snippet
};

} // namespace pyracms
