#include "services/ElasticsearchService.h"

#include <curl/curl.h>
#include <json/json.h>
#include <sstream>

namespace pyracms {

ElasticsearchService &ElasticsearchService::instance() {
    static ElasticsearchService inst;
    return inst;
}

void ElasticsearchService::initialize() {
    const char *url = std::getenv("ELASTICSEARCH_URL");
    if (url && std::string(url).length() > 0) {
        esUrl_ = url;
        configured_ = true;
        createIndexes();
        LOG_INFO << "Elasticsearch configured at " << esUrl_;
    }
}

bool ElasticsearchService::isConfigured() const {
    return configured_;
}

size_t ElasticsearchService::curlWriteCallback(char *ptr, size_t size, size_t nmemb, std::string *data) {
    data->append(ptr, size * nmemb);
    return size * nmemb;
}

std::string ElasticsearchService::httpRequest(const std::string &method,
                                               const std::string &path,
                                               const std::string &body) {
    std::string response;
    CURL *curl = curl_easy_init();
    if (!curl) return "";

    auto url = esUrl_ + path;
    curl_easy_setopt(curl, CURLOPT_URL, url.c_str());
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, curlWriteCallback);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, &response);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 10L);

    struct curl_slist *headers = nullptr;
    headers = curl_slist_append(headers, "Content-Type: application/json");
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);

    if (method == "PUT") {
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "PUT");
    } else if (method == "DELETE") {
        curl_easy_setopt(curl, CURLOPT_CUSTOMREQUEST, "DELETE");
    } else if (method == "POST") {
        curl_easy_setopt(curl, CURLOPT_POST, 1L);
    }

    if (!body.empty()) {
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, body.c_str());
    }

    curl_easy_perform(curl);
    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    return response;
}

Json::Value ElasticsearchService::parseJson(const std::string &str) {
    Json::Value root;
    Json::CharReaderBuilder reader;
    std::istringstream stream(str);
    std::string errors;
    Json::parseFromStream(reader, stream, &root, &errors);
    return root;
}

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

void ElasticsearchService::indexArticle(int tenantId, int articleId,
                                         const std::string &name,
                                         const std::string &displayName,
                                         const std::string &content,
                                         const std::string &createdAt) {
    Json::Value doc;
    doc["tenant_id"] = tenantId;
    doc["title"] = displayName;
    doc["content"] = content;
    doc["name"] = name;
    doc["url"] = "/articles/" + name;
    doc["type"] = "article";
    doc["created_at"] = createdAt;

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, doc);
    httpRequest("PUT", "/pyracms_articles/_doc/" + std::to_string(articleId), body);
}

void ElasticsearchService::indexForumPost(int tenantId, int postId,
                                           const std::string &title,
                                           const std::string &content,
                                           int threadId,
                                           const std::string &createdAt) {
    Json::Value doc;
    doc["tenant_id"] = tenantId;
    doc["title"] = title;
    doc["content"] = content;
    doc["url"] = "/forum/thread/" + std::to_string(threadId);
    doc["type"] = "forum_post";
    doc["created_at"] = createdAt;

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, doc);
    httpRequest("PUT", "/pyracms_forum_posts/_doc/" + std::to_string(postId), body);
}

void ElasticsearchService::indexSnippet(int tenantId, int snippetId,
                                         const std::string &title,
                                         const std::string &code,
                                         const std::string &language,
                                         const std::string &createdAt) {
    Json::Value doc;
    doc["tenant_id"] = tenantId;
    doc["title"] = title;
    doc["content"] = code;
    doc["name"] = language;
    doc["url"] = "/snippets/" + std::to_string(snippetId);
    doc["type"] = "snippet";
    doc["created_at"] = createdAt;

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, doc);
    httpRequest("PUT", "/pyracms_snippets/_doc/" + std::to_string(snippetId), body);
}

void ElasticsearchService::indexGameDep(int tenantId, int pageId,
                                         const std::string &name,
                                         const std::string &displayName,
                                         const std::string &description,
                                         const std::string &createdAt) {
    Json::Value doc;
    doc["tenant_id"] = tenantId;
    doc["title"] = displayName;
    doc["content"] = description;
    doc["name"] = name;
    doc["url"] = "/gamedep/" + name;
    doc["type"] = "gamedep";
    doc["created_at"] = createdAt;

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, doc);
    httpRequest("PUT", "/pyracms_gamedeps/_doc/" + std::to_string(pageId), body);
}

void ElasticsearchService::deleteDocument(const std::string &index, int id) {
    httpRequest("DELETE", "/" + index + "/_doc/" + std::to_string(id));
}

void ElasticsearchService::search(int tenantId, const std::string &query,
                                   const std::string &type,
                                   int limit, int offset,
                                   std::function<void(const SearchResults &)> cb) {
    // Build multi-index search
    std::string indexes = "pyracms_articles,pyracms_forum_posts,pyracms_snippets,pyracms_gamedeps";
    if (type == "article") indexes = "pyracms_articles";
    else if (type == "forum_post") indexes = "pyracms_forum_posts";
    else if (type == "snippet") indexes = "pyracms_snippets";
    else if (type == "gamedep") indexes = "pyracms_gamedeps";

    Json::Value esQuery;
    Json::Value boolQuery;

    // Must match tenant
    Json::Value tenantFilter;
    tenantFilter["term"]["tenant_id"] = tenantId;
    boolQuery["filter"].append(tenantFilter);

    // Multi-match across title and content
    Json::Value multiMatch;
    multiMatch["multi_match"]["query"] = query;
    multiMatch["multi_match"]["fields"].append("title^3");
    multiMatch["multi_match"]["fields"].append("content");
    multiMatch["multi_match"]["type"] = "best_fields";
    multiMatch["multi_match"]["fuzziness"] = "AUTO";
    boolQuery["must"].append(multiMatch);

    esQuery["query"]["bool"] = boolQuery;
    esQuery["from"] = offset;
    esQuery["size"] = limit;
    esQuery["highlight"]["fields"]["title"] = Json::objectValue;
    esQuery["highlight"]["fields"]["content"]["fragment_size"] = 200;
    esQuery["highlight"]["fields"]["content"]["number_of_fragments"] = 1;

    // Aggregation for facets
    esQuery["aggs"]["types"]["terms"]["field"] = "type";

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, esQuery);

    auto response = httpRequest("POST", "/" + indexes + "/_search", body);
    auto root = parseJson(response);

    SearchResults results;
    results.query = query;
    results.totalCount = 0;

    if (root.isMember("hits")) {
        auto &hits = root["hits"];
        results.totalCount = hits["total"]["value"].asInt();

        for (const auto &hit : hits["hits"]) {
            SearchResultItem item;
            auto &src = hit["_source"];
            item.type = src["type"].asString();
            item.id = std::stoi(hit["_id"].asString());
            item.title = src["title"].asString();
            item.url = src["url"].asString();
            item.rank = hit["_score"].asDouble();
            item.createdAt = src["created_at"].asString();

            // Use highlight if available
            if (hit.isMember("highlight") && hit["highlight"].isMember("content")) {
                item.snippet = hit["highlight"]["content"][0].asString();
            } else {
                auto content = src["content"].asString();
                item.snippet = content.size() > 200 ? content.substr(0, 200) + "..." : content;
            }

            results.items.push_back(item);
        }
    }

    // Facets from aggregation
    if (root.isMember("aggregations") && root["aggregations"].isMember("types")) {
        for (const auto &bucket : root["aggregations"]["types"]["buckets"]) {
            results.facets[bucket["key"].asString()] = bucket["doc_count"].asInt();
        }
    }

    cb(results);
}

void ElasticsearchService::autocomplete(int tenantId, const std::string &prefix,
                                         int limit,
                                         std::function<void(const std::vector<AutocompleteItem> &)> cb) {
    Json::Value esQuery;
    Json::Value boolQuery;

    Json::Value tenantFilter;
    tenantFilter["term"]["tenant_id"] = tenantId;
    boolQuery["filter"].append(tenantFilter);

    Json::Value matchQuery;
    matchQuery["match"]["title.autocomplete"] = prefix;
    boolQuery["must"].append(matchQuery);

    esQuery["query"]["bool"] = boolQuery;
    esQuery["size"] = limit;
    esQuery["_source"].append("title");
    esQuery["_source"].append("type");
    esQuery["_source"].append("url");

    Json::StreamWriterBuilder writer;
    auto body = Json::writeString(writer, esQuery);

    auto response = httpRequest("POST",
        "/pyracms_articles,pyracms_forum_posts,pyracms_snippets,pyracms_gamedeps/_search", body);
    auto root = parseJson(response);

    std::vector<AutocompleteItem> items;
    if (root.isMember("hits")) {
        for (const auto &hit : root["hits"]["hits"]) {
            AutocompleteItem item;
            item.text = hit["_source"]["title"].asString();
            item.type = hit["_source"]["type"].asString();
            item.url = hit["_source"]["url"].asString();
            items.push_back(item);
        }
    }

    cb(items);
}

void ElasticsearchService::syncFromDatabase(const DbClientPtr &db, int tenantId) {
    // Sync articles
    db->execSqlAsync(
        "SELECT a.id, a.name, a.display_name, a.created_at, "
        "  (SELECT content FROM article_revisions WHERE article_id = a.id "
        "   ORDER BY created_at DESC LIMIT 1) AS content "
        "FROM articles a WHERE a.tenant_id = $1 AND a.status = 'published'",
        [this, tenantId](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                indexArticle(tenantId, row["id"].as<int>(),
                    row["name"].as<std::string>(),
                    row["display_name"].as<std::string>(),
                    row["content"].isNull() ? "" : row["content"].as<std::string>(),
                    row["created_at"].as<std::string>());
            }
            LOG_INFO << "Synced " << result.size() << " articles to Elasticsearch";
        },
        [](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "ES sync articles failed: " << e.base().what();
        },
        tenantId);

    // Sync forum posts
    db->execSqlAsync(
        "SELECT p.id, p.title, p.content, p.thread_id, p.created_at "
        "FROM forum_posts p "
        "JOIN forum_threads t ON t.id = p.thread_id "
        "JOIN forums f ON f.id = t.forum_id "
        "JOIN forum_categories c ON c.id = f.category_id "
        "WHERE c.tenant_id = $1",
        [this, tenantId](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                indexForumPost(tenantId, row["id"].as<int>(),
                    row["title"].isNull() ? "" : row["title"].as<std::string>(),
                    row["content"].as<std::string>(),
                    row["thread_id"].as<int>(),
                    row["created_at"].as<std::string>());
            }
            LOG_INFO << "Synced " << result.size() << " forum posts to Elasticsearch";
        },
        [](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "ES sync forum posts failed: " << e.base().what();
        },
        tenantId);

    // Sync gamedeps
    db->execSqlAsync(
        "SELECT id, name, display_name, description, created_at "
        "FROM gamedep_pages WHERE tenant_id = $1",
        [this, tenantId](const drogon::orm::Result &result) {
            for (const auto &row : result) {
                indexGameDep(tenantId, row["id"].as<int>(),
                    row["name"].as<std::string>(),
                    row["display_name"].as<std::string>(),
                    row["description"].isNull() ? "" : row["description"].as<std::string>(),
                    row["created_at"].as<std::string>());
            }
            LOG_INFO << "Synced " << result.size() << " gamedeps to Elasticsearch";
        },
        [](const drogon::orm::DrogonDbException &e) {
            LOG_ERROR << "ES sync gamedeps failed: " << e.base().what();
        },
        tenantId);
}

} // namespace pyracms
