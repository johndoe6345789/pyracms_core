#include "services/elasticsearch/EsMapping.h"

namespace pyracms {

// English analysis (stemming, stop words) for titles and bodies; titles
// also get an edge-ngram field for search-as-you-type. `summary` is only
// stored, to show under a hit when nothing better can be highlighted.
const char *esIndexDefinition() {
    return R"({
  "settings": {"number_of_shards": 1, "number_of_replicas": 0,
    "analysis": {
      "filter": {"edge": {"type": "edge_ngram", "min_gram": 2,
                          "max_gram": 20}},
      "analyzer": {"autocomplete": {"type": "custom",
        "tokenizer": "standard", "filter": ["lowercase", "edge"]}}}},
  "mappings": {"properties": {
    "tenant_id": {"type": "integer"},
    "type": {"type": "keyword"},
    "ref_id": {"type": "integer"},
    "title": {"type": "text", "analyzer": "english", "fields": {
      "autocomplete": {"type": "text", "analyzer": "autocomplete",
                       "search_analyzer": "standard"}}},
    "body": {"type": "text", "analyzer": "english"},
    "tags": {"type": "text", "analyzer": "simple",
             "fields": {"keyword": {"type": "keyword"}}},
    "author": {"type": "keyword"},
    "url": {"type": "keyword"},
    "summary": {"type": "keyword", "index": false},
    "created_at": {"type": "date"}}}
})";
}

} // namespace pyracms
