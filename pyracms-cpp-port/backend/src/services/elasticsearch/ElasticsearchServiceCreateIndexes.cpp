#include "services/DbError.h"
#include "services/ElasticsearchService.h"
#include "services/elasticsearch/ElasticsearchServiceInternal.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

void ElasticsearchService::createIndexes() {
    auto settings = R"({
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
                "analyzer": {
                    "autocomplete_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": ["lowercase", "edge_ngram_filter"]
                    }
                },
                "filter": {
                    "edge_ngram_filter": {
                        "type": "edge_ngram",
                        "min_gram": 2,
                        "max_gram": 20
                    }
                }
            }
        },
        "mappings": {
            "properties": {
                "tenant_id": {"type": "integer"},
                "title": {
                    "type": "text",
                    "fields": {
                        "autocomplete": {
                            "type": "text",
                            "analyzer": "autocomplete_analyzer",
                            "search_analyzer": "standard"
                        }
                    }
                },
                "content": {"type": "text"},
                "name": {"type": "keyword"},
                "url": {"type": "keyword"},
                "type": {"type": "keyword"},
                "created_at": {"type": "date"}
            }
        }
    })";

    // Create indexes (ignore if they already exist)
    httpRequest("PUT", "/pyracms_articles", settings);
    httpRequest("PUT", "/pyracms_forum_posts", settings);
    httpRequest("PUT", "/pyracms_snippets", settings);
    httpRequest("PUT", "/pyracms_gamedeps", settings);
}

} // namespace pyracms
