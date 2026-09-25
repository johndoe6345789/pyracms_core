#include "services/ElasticsearchService.h"
#include "services/elasticsearch/EsHttp.h"
#include "services/elasticsearch/EsMapping.h"
#include "services/elasticsearch/EsQuery.h"

namespace pyracms {

static std::string searchPath() {
    return std::string("/") + kEsIndex + "/_search";
}

void ElasticsearchService::search(
    int tenantId, const std::string &query, const std::string &type,
    int limit, int offset, std::function<void(const SearchResults &)> cb,
    Unavailable unavailable) {
    esRequest(url_, drogon::Post, searchPath(),
              esSearchBody(tenantId, query, type, limit, offset), 5.0,
              [query, cb, unavailable](const EsReply &r) {
                  if (!r.ok || r.status != 200)
                      return unavailable();
                  cb(esParseSearch(r.json, query));
              });
}

void ElasticsearchService::autocomplete(
    int tenantId, const std::string &prefix, int limit,
    std::function<void(const std::vector<AutocompleteItem> &)> cb,
    Unavailable unavailable) {
    esRequest(url_, drogon::Post, searchPath(),
              esAutocompleteBody(tenantId, prefix, limit), 3.0,
              [cb, unavailable](const EsReply &r) {
                  if (!r.ok || r.status != 200)
                      return unavailable();
                  cb(esParseAutocomplete(r.json));
              });
}

} // namespace pyracms
