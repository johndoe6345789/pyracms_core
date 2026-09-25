#include "services/elasticsearch/EsQuery.h"

#include "services/elasticsearch/EsHttp.h"

namespace pyracms {

static Json::Value tenantFilter(int tenantId) {
    Json::Value f;
    f["term"]["tenant_id"] = tenantId;
    return f;
}

// Every word must match (typos tolerated) in the title, tags, body or
// author; a phrase hit in the title ranks first. The type filter is a
// post_filter so the per-type counts still cover the whole site.
std::string esSearchBody(int tenantId, const std::string &query,
                         const std::string &type, int limit, int offset) {
    Json::Value b;
    b["query"]["bool"]["filter"].append(tenantFilter(tenantId));
    Json::Value must;
    auto &mm = must["multi_match"];
    mm["query"] = query;
    for (const char *f : {"title^4", "tags^3", "body", "author"})
        mm["fields"].append(f);
    mm["operator"] = "and";
    mm["fuzziness"] = "AUTO";
    mm["prefix_length"] = 1;
    b["query"]["bool"]["must"].append(must);
    Json::Value should;
    should["match_phrase"]["title"]["query"] = query;
    should["match_phrase"]["title"]["boost"] = 3;
    b["query"]["bool"]["should"].append(should);
    if (!type.empty() && type != "all")
        b["post_filter"]["term"]["type"] = type;
    b["from"] = offset;
    b["size"] = limit;
    for (const char *f : {"type", "ref_id", "title", "url", "summary",
                          "created_at"})
        b["_source"].append(f);
    // Plain-text fragments (no markup): the frontend does its own marking.
    auto &hl = b["highlight"];
    hl["pre_tags"].append("");
    hl["post_tags"].append("");
    hl["fields"]["body"]["fragment_size"] = 200;
    hl["fields"]["body"]["number_of_fragments"] = 1;
    b["aggs"]["types"]["terms"]["field"] = "type";
    return esWrite(b);
}

std::string esAutocompleteBody(int tenantId, const std::string &prefix,
                               int limit) {
    Json::Value b;
    b["query"]["bool"]["filter"].append(tenantFilter(tenantId));
    Json::Value must;
    must["match"]["title.autocomplete"]["query"] = prefix;
    must["match"]["title.autocomplete"]["operator"] = "and";
    b["query"]["bool"]["must"].append(must);
    b["size"] = limit;
    for (const char *f : {"title", "type", "url"})
        b["_source"].append(f);
    return esWrite(b);
}

} // namespace pyracms
