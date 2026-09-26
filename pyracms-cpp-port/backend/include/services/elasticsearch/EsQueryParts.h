#pragma once

#include "services/elasticsearch/EsHttp.h"

#include <json/json.h>
#include <string>

namespace pyracms {

// Highlight markers: private-use characters that cannot occur in content,
// so the page can turn them into <mark> without ever trusting markup.
constexpr const char *kEsMarkOpen = "\xEE\x80\x80";  // U+E000
constexpr const char *kEsMarkClose = "\xEE\x80\x81"; // U+E001

inline Json::Value esTenantFilter(int tenantId) {
    Json::Value f;
    f["term"]["tenant_id"] = tenantId;
    return f;
}

// Every word must match somewhere (words may sit in different fields), or
// in one field with a typo. Typos are tolerated only from 5 letters, so
// "golf" never turns into "gulf" or "gold".
inline Json::Value esTextQuery(const std::string &query) {
    Json::Value across, typo, q;
    across["multi_match"]["query"] = query;
    across["multi_match"]["type"] = "cross_fields";
    across["multi_match"]["operator"] = "and";
    typo["multi_match"]["query"] = query;
    typo["multi_match"]["operator"] = "and";
    typo["multi_match"]["fuzziness"] = "AUTO:5,10";
    typo["multi_match"]["prefix_length"] = 1;
    for (const char *f : {"title^4", "tags^3", "body", "author"}) {
        across["multi_match"]["fields"].append(f);
        typo["multi_match"]["fields"].append(f);
    }
    q["bool"]["should"].append(across);
    q["bool"]["should"].append(typo);
    q["bool"]["minimum_should_match"] = 1;
    return q;
}

// Marks matches in the title and a couple of body excerpts; with no
// match in the body the excerpt is simply its start.
inline Json::Value esHighlight(int fragments, int size) {
    Json::Value hl;
    hl["pre_tags"].append(kEsMarkOpen);
    hl["post_tags"].append(kEsMarkClose);
    hl["require_field_match"] = false;
    hl["fields"]["title"]["number_of_fragments"] = 0;
    hl["fields"]["body"]["fragment_size"] = size;
    hl["fields"]["body"]["number_of_fragments"] = fragments;
    hl["fields"]["body"]["no_match_size"] = size;
    return hl;
}

} // namespace pyracms
