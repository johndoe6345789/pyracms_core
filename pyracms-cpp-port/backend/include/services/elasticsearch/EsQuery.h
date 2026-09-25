#pragma once

#include "services/SearchService.h"

#include <json/json.h>
#include <string>

namespace pyracms {

// Request bodies for the index (pure, so they can be unit tested).
std::string esSearchBody(int tenantId, const std::string &query,
                         const std::string &type, int limit, int offset);
std::string esAutocompleteBody(int tenantId, const std::string &prefix,
                               int limit);

SearchResults esParseSearch(const Json::Value &root, const std::string &query);
std::vector<AutocompleteItem> esParseAutocomplete(const Json::Value &root);

} // namespace pyracms
