#include "services/elasticsearch/EsQuery.h"

#include "services/elasticsearch/EsQueryParts.h"

namespace pyracms {

// Search-as-you-type: titles that start with what has been typed, plus
// anything the full search would find, so "golf" suggests the pages about
// golf and not only pages titled "golf...".
std::string esAutocompleteBody(int tenantId, const std::string &prefix,
                               int limit) {
    Json::Value b, starts;
    b["query"]["bool"]["filter"].append(esTenantFilter(tenantId));
    starts["match"]["title.autocomplete"]["query"] = prefix;
    starts["match"]["title.autocomplete"]["operator"] = "and";
    starts["match"]["title.autocomplete"]["boost"] = 4;
    b["query"]["bool"]["should"].append(starts);
    b["query"]["bool"]["should"].append(esTextQuery(prefix));
    b["query"]["bool"]["minimum_should_match"] = 1;
    b["size"] = limit;
    for (const char *f : {"title", "type", "url"})
        b["_source"].append(f);
    b["highlight"] = esHighlight(1, 90);
    return esWrite(b);
}

} // namespace pyracms
