#include "services/elasticsearch/EsQuery.h"

#include "services/elasticsearch/EsQueryParts.h"

namespace pyracms {

// A phrase hit in the title ranks first. The type filter is a post_filter
// so the per-type counts still cover the whole site.
std::string esSearchBody(int tenantId, const std::string &query,
                         const std::string &type, int limit, int offset) {
    Json::Value b;
    b["query"]["bool"]["filter"].append(esTenantFilter(tenantId));
    b["query"]["bool"]["must"].append(esTextQuery(query));
    Json::Value title, body;
    title["match_phrase"]["title"]["query"] = query;
    title["match_phrase"]["title"]["boost"] = 3;
    body["match_phrase"]["body"]["query"] = query;
    body["match_phrase"]["body"]["boost"] = 1.5;
    b["query"]["bool"]["should"].append(title);
    b["query"]["bool"]["should"].append(body);
    if (!type.empty() && type != "all")
        b["post_filter"]["term"]["type"] = type;
    b["from"] = offset;
    b["size"] = limit;
    for (const char *f : {"type", "ref_id", "title", "url", "summary",
                          "created_at", "tags", "author"})
        b["_source"].append(f);
    b["highlight"] = esHighlight(2, 170);
    b["aggs"]["types"]["terms"]["field"] = "type";
    return esWrite(b);
}

} // namespace pyracms
