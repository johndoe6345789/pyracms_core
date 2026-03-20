#include "services/SearchService.h"
#include "services/ElasticsearchService.h"
#include "services/CacheService.h"

#include <memory>
#include <mutex>

namespace pyracms {

bool SearchService::useElasticsearch() {
    const char *engine = std::getenv("SEARCH_ENGINE");
    return engine && std::string(engine) == "elasticsearch" &&
           ElasticsearchService::instance().isConfigured();
}

void SearchService::search(
    const DbClientPtr &db, int tenantId,
    const std::string &query, const std::string &type,
    int limit, int offset,
    std::function<void(const SearchResults &)> cb) {

    // Delegate to Elasticsearch if configured
    if (useElasticsearch()) {
        // Check Redis cache first
        auto cacheKey = CacheService::searchKey(tenantId, query, type);
        auto &cache = CacheService::instance();
        if (cache.isConnected()) {
            cache.get(cacheKey, [this, db, tenantId, query, type, limit, offset, cb, cacheKey](
                const std::string &cached, bool found) {
                if (found) {
                    // Parse cached JSON
                    Json::Value root;
                    Json::CharReaderBuilder reader;
                    std::istringstream stream(cached);
                    std::string errors;
                    if (Json::parseFromStream(reader, stream, &root, &errors)) {
                        SearchResults results;
                        results.query = root["query"].asString();
                        results.totalCount = root["totalCount"].asInt();
                        for (const auto &item : root["items"]) {
                            SearchResultItem sri;
                            sri.type = item["type"].asString();
                            sri.id = item["id"].asInt();
                            sri.title = item["title"].asString();
                            sri.snippet = item["snippet"].asString();
                            sri.url = item["url"].asString();
                            sri.rank = item["rank"].asDouble();
                            sri.createdAt = item["createdAt"].asString();
                            results.items.push_back(sri);
                        }
                        for (const auto &key : root["facets"].getMemberNames()) {
                            results.facets[key] = root["facets"][key].asInt();
                        }
                        cb(results);
                        return;
                    }
                }
                // Cache miss — search ES
                ElasticsearchService::instance().search(tenantId, query, type, limit, offset,
                    [cb, cacheKey](const SearchResults &results) {
                        // Cache the result for 60 seconds
                        Json::Value cacheVal;
                        cacheVal["query"] = results.query;
                        cacheVal["totalCount"] = results.totalCount;
                        cacheVal["items"] = Json::Value(Json::arrayValue);
                        for (const auto &item : results.items) {
                            Json::Value ji;
                            ji["type"] = item.type;
                            ji["id"] = item.id;
                            ji["title"] = item.title;
                            ji["snippet"] = item.snippet;
                            ji["url"] = item.url;
                            ji["rank"] = item.rank;
                            ji["createdAt"] = item.createdAt;
                            cacheVal["items"].append(ji);
                        }
                        cacheVal["facets"] = Json::Value(Json::objectValue);
                        for (const auto &[k, v] : results.facets) {
                            cacheVal["facets"][k] = v;
                        }
                        Json::StreamWriterBuilder writer;
                        CacheService::instance().set(cacheKey, Json::writeString(writer, cacheVal), 60, [](bool) {});
                        cb(results);
                    });
            });
            return;
        }
        // No Redis — search ES directly
        ElasticsearchService::instance().search(tenantId, query, type, limit, offset, cb);
        return;
    }

    // Fallback: PostgreSQL full-text search
    // Convert user query to tsquery format
    // Replace spaces with & for AND matching
    std::string tsQuery;
    std::string word;
    std::istringstream stream(query);
    bool first = true;
    while (stream >> word) {
        if (!first) tsQuery += " & ";
        tsQuery += word + ":*";
        first = false;
    }

    if (tsQuery.empty()) {
        SearchResults empty;
        empty.query = query;
        empty.totalCount = 0;
        cb(empty);
        return;
    }

    // Use shared state to collect results from parallel queries
    struct CollectorState {
        std::mutex mu;
        SearchResults results;
        int pendingQueries;
        std::function<void(const SearchResults &)> cb;
    };

    auto state = std::make_shared<CollectorState>();
    state->results.query = query;
    state->results.totalCount = 0;
    state->cb = cb;

    // Determine which types to search
    bool searchAll = type.empty() || type == "all";
    bool doArticles = searchAll || type == "article";
    bool doForumPosts = searchAll || type == "forum_post";
    bool doSnippets = searchAll || type == "snippet";
    bool doGameDeps = searchAll || type == "gamedep";

    state->pendingQueries = 0;
    if (doArticles) state->pendingQueries++;
    if (doForumPosts) state->pendingQueries++;
    if (doSnippets) state->pendingQueries++;
    if (doGameDeps) state->pendingQueries++;

    if (state->pendingQueries == 0) {
        cb(state->results);
        return;
    }

    auto collectResults = [state](const std::vector<SearchResultItem> &items, int count) {
        std::lock_guard<std::mutex> lock(state->mu);
        for (const auto &item : items) {
            state->results.items.push_back(item);
        }
        state->results.totalCount += count;
        // Build facet counts
        if (!items.empty()) {
            state->results.facets[items[0].type] += count;
        }
        state->pendingQueries--;
        if (state->pendingQueries == 0) {
            // Sort by rank descending
            std::sort(state->results.items.begin(), state->results.items.end(),
                [](const SearchResultItem &a, const SearchResultItem &b) {
                    return a.rank > b.rank;
                });
            state->cb(state->results);
        }
    };

    if (doArticles) {
        searchArticles(db, tenantId, tsQuery, limit, offset, collectResults);
    }
    if (doForumPosts) {
        searchForumPosts(db, tenantId, tsQuery, limit, offset, collectResults);
    }
    if (doSnippets) {
        searchSnippets(db, tenantId, tsQuery, limit, offset, collectResults);
    }
    if (doGameDeps) {
        searchGameDeps(db, tenantId, tsQuery, limit, offset, collectResults);
    }
}

void SearchService::searchArticles(
    const DbClientPtr &db, int tenantId,
    const std::string &tsQuery, int limit, int offset,
    std::function<void(const std::vector<SearchResultItem> &, int)> cb) {

    db->execSqlAsync(
        "SELECT a.id, a.name, a.display_name, "
        "ts_rank(to_tsvector('english', a.name || ' ' || a.display_name), to_tsquery('english', $2)) AS rank, "
        "a.created_at "
        "FROM articles a "
        "WHERE a.tenant_id = $1 "
        "AND to_tsvector('english', a.name || ' ' || a.display_name) @@ to_tsquery('english', $2) "
        "ORDER BY rank DESC LIMIT $3 OFFSET $4",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchResultItem> items;
            for (const auto &row : result) {
                SearchResultItem item;
                item.type = "article";
                item.id = row["id"].as<int>();
                item.title = row["display_name"].as<std::string>();
                item.snippet = row["name"].as<std::string>();
                item.url = "/articles/" + row["name"].as<std::string>();
                item.rank = row["rank"].as<double>();
                item.createdAt = row["created_at"].as<std::string>();
                items.push_back(item);
            }
            cb(items, static_cast<int>(items.size()));
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({}, 0);
        },
        tenantId, tsQuery, limit, offset);
}

void SearchService::searchForumPosts(
    const DbClientPtr &db, int tenantId,
    const std::string &tsQuery, int limit, int offset,
    std::function<void(const std::vector<SearchResultItem> &, int)> cb) {

    db->execSqlAsync(
        "SELECT p.id, p.title, "
        "LEFT(p.content, 200) AS snippet, "
        "ts_rank(to_tsvector('english', p.title || ' ' || p.content), to_tsquery('english', $2)) AS rank, "
        "p.created_at, p.thread_id "
        "FROM forum_posts p "
        "JOIN forum_threads t ON t.id = p.thread_id "
        "JOIN forums f ON f.id = t.forum_id "
        "JOIN forum_categories c ON c.id = f.category_id "
        "WHERE c.tenant_id = $1 "
        "AND to_tsvector('english', p.title || ' ' || p.content) @@ to_tsquery('english', $2) "
        "ORDER BY rank DESC LIMIT $3 OFFSET $4",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchResultItem> items;
            for (const auto &row : result) {
                SearchResultItem item;
                item.type = "forum_post";
                item.id = row["id"].as<int>();
                item.title = row["title"].isNull() ? "" : row["title"].as<std::string>();
                item.snippet = row["snippet"].isNull() ? "" : row["snippet"].as<std::string>();
                item.url = "/forum/thread/" + std::to_string(row["thread_id"].as<int>());
                item.rank = row["rank"].as<double>();
                item.createdAt = row["created_at"].as<std::string>();
                items.push_back(item);
            }
            cb(items, static_cast<int>(items.size()));
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({}, 0);
        },
        tenantId, tsQuery, limit, offset);
}

void SearchService::searchSnippets(
    const DbClientPtr &db, int tenantId,
    const std::string &tsQuery, int limit, int offset,
    std::function<void(const std::vector<SearchResultItem> &, int)> cb) {

    db->execSqlAsync(
        "SELECT s.id, s.title, s.language, "
        "LEFT(s.code, 200) AS snippet, "
        "ts_rank(to_tsvector('english', s.title || ' ' || s.code), to_tsquery('english', $2)) AS rank, "
        "s.created_at "
        "FROM code_snippets s "
        "WHERE s.tenant_id = $1 AND s.visibility = 'public' "
        "AND to_tsvector('english', s.title || ' ' || s.code) @@ to_tsquery('english', $2) "
        "ORDER BY rank DESC LIMIT $3 OFFSET $4",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchResultItem> items;
            for (const auto &row : result) {
                SearchResultItem item;
                item.type = "snippet";
                item.id = row["id"].as<int>();
                item.title = row["title"].as<std::string>();
                item.snippet = row["snippet"].isNull() ? "" : row["snippet"].as<std::string>();
                item.url = "/snippets/" + std::to_string(row["id"].as<int>());
                item.rank = row["rank"].as<double>();
                item.createdAt = row["created_at"].as<std::string>();
                items.push_back(item);
            }
            cb(items, static_cast<int>(items.size()));
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({}, 0);
        },
        tenantId, tsQuery, limit, offset);
}

void SearchService::searchGameDeps(
    const DbClientPtr &db, int tenantId,
    const std::string &tsQuery, int limit, int offset,
    std::function<void(const std::vector<SearchResultItem> &, int)> cb) {

    db->execSqlAsync(
        "SELECT g.id, g.name, g.display_name, g.description, "
        "ts_rank(to_tsvector('english', g.name || ' ' || g.display_name || ' ' || g.description), "
        "to_tsquery('english', $2)) AS rank, "
        "g.created_at "
        "FROM gamedep_pages g "
        "WHERE g.tenant_id = $1 "
        "AND to_tsvector('english', g.name || ' ' || g.display_name || ' ' || g.description) "
        "@@ to_tsquery('english', $2) "
        "ORDER BY rank DESC LIMIT $3 OFFSET $4",
        [cb](const drogon::orm::Result &result) {
            std::vector<SearchResultItem> items;
            for (const auto &row : result) {
                SearchResultItem item;
                item.type = "gamedep";
                item.id = row["id"].as<int>();
                item.title = row["display_name"].as<std::string>();
                item.snippet = row["description"].isNull() ? "" : row["description"].as<std::string>();
                item.url = "/gamedep/" + row["name"].as<std::string>();
                item.rank = row["rank"].as<double>();
                item.createdAt = row["created_at"].as<std::string>();
                items.push_back(item);
            }
            cb(items, static_cast<int>(items.size()));
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({}, 0);
        },
        tenantId, tsQuery, limit, offset);
}

void SearchService::autocomplete(
    const DbClientPtr &db, int tenantId,
    const std::string &prefix, int limit,
    std::function<void(const std::vector<AutocompleteItem> &)> cb) {

    // Delegate to Elasticsearch if configured
    if (useElasticsearch()) {
        // Check Redis cache
        auto cacheKey = CacheService::autocompleteKey(tenantId, prefix);
        auto &cache = CacheService::instance();
        if (cache.isConnected()) {
            cache.get(cacheKey, [this, db, tenantId, prefix, limit, cb, cacheKey](
                const std::string &cached, bool found) {
                if (found) {
                    Json::Value root;
                    Json::CharReaderBuilder reader;
                    std::istringstream stream(cached);
                    std::string errors;
                    if (Json::parseFromStream(reader, stream, &root, &errors)) {
                        std::vector<AutocompleteItem> items;
                        for (const auto &item : root) {
                            AutocompleteItem ai;
                            ai.text = item["text"].asString();
                            ai.type = item["type"].asString();
                            ai.url = item["url"].asString();
                            items.push_back(ai);
                        }
                        cb(items);
                        return;
                    }
                }
                ElasticsearchService::instance().autocomplete(tenantId, prefix, limit,
                    [cb, cacheKey](const std::vector<AutocompleteItem> &items) {
                        // Cache for 30 seconds
                        Json::Value cacheVal(Json::arrayValue);
                        for (const auto &item : items) {
                            Json::Value ji;
                            ji["text"] = item.text;
                            ji["type"] = item.type;
                            ji["url"] = item.url;
                            cacheVal.append(ji);
                        }
                        Json::StreamWriterBuilder writer;
                        CacheService::instance().set(cacheKey, Json::writeString(writer, cacheVal), 30, [](bool) {});
                        cb(items);
                    });
            });
            return;
        }
        ElasticsearchService::instance().autocomplete(tenantId, prefix, limit, cb);
        return;
    }

    // Fallback: PostgreSQL prefix search
    auto likePattern = prefix + "%";

    db->execSqlAsync(
        "("
        "  SELECT display_name AS text, 'article' AS type, "
        "  '/articles/' || name AS url "
        "  FROM articles WHERE tenant_id = $1 AND status = 'published' "
        "  AND LOWER(display_name) LIKE LOWER($2) LIMIT $3"
        ") UNION ALL ("
        "  SELECT title AS text, 'forum_post' AS type, "
        "  '/forum/thread/' || thread_id::text AS url "
        "  FROM forum_posts p "
        "  JOIN forum_threads t ON t.id = p.thread_id "
        "  JOIN forums f ON f.id = t.forum_id "
        "  JOIN forum_categories c ON c.id = f.category_id "
        "  WHERE c.tenant_id = $1 AND p.title IS NOT NULL "
        "  AND LOWER(p.title) LIKE LOWER($2) LIMIT $3"
        ") UNION ALL ("
        "  SELECT display_name AS text, 'gamedep' AS type, "
        "  '/gamedep/' || name AS url "
        "  FROM gamedep_pages WHERE tenant_id = $1 "
        "  AND LOWER(display_name) LIKE LOWER($2) LIMIT $3"
        ") LIMIT $3",
        [cb](const drogon::orm::Result &result) {
            std::vector<AutocompleteItem> items;
            items.reserve(result.size());
            for (const auto &row : result) {
                AutocompleteItem item;
                item.text = row["text"].as<std::string>();
                item.type = row["type"].as<std::string>();
                item.url = row["url"].as<std::string>();
                items.push_back(item);
            }
            cb(items);
        },
        [cb](const drogon::orm::DrogonDbException &) {
            cb({});
        },
        tenantId, likePattern, limit);
}

} // namespace pyracms
